import { getRoomBySocketId } from "../game/RoomManager.js";

const VALID_TYPES = new Set(["start", "move", "end"]);
const MAX_STROKES_LIMIT = 30000;

export function registerDrawHandlers(io, socket) {
    socket.on("draw", (batch) => {
        try {
            const room = getRoomBySocketId(socket.id);
            if (!room || room.status !== "DRAWING" || room.drawerId !== socket.id) {
                return;
            }

            if (!Array.isArray(batch) || batch.length === 0) return;

            const cleanBatch = batch
                .slice(0, 200)
                .filter(
                    (s) =>
                        s &&
                        Number.isFinite(s.x) &&
                        Number.isFinite(s.y) &&
                        VALID_TYPES.has(s.type)
                )
                .map((s) => ({
                    x: Math.max(0, Math.min(1, Number(s.x))),
                    y: Math.max(0, Math.min(1, Number(s.y))),
                    type: s.type,
                    color: String(s.color || "#171c22").slice(0, 16),
                    brushSize: Math.min(40, Math.max(1, Number(s.brushSize) || 4)),
                }));

            if (cleanBatch.length === 0) return;

            if (room.strokes.length < MAX_STROKES_LIMIT) {
                room.strokes.push(...cleanBatch);

                // Group strokes into segments for undo capability
                if (!room.strokeHistory) room.strokeHistory = [];
                for (const point of cleanBatch) {
                    if (point.type === "start" || room.strokeHistory.length === 0) {
                        room.strokeHistory.push([point]);
                    } else {
                        const currentSegment = room.strokeHistory[room.strokeHistory.length - 1];
                        currentSegment.push(point);
                    }
                }
            }

            socket.to(room.code).emit("draw_update", cleanBatch);
        } catch (error) {
            console.error("Error handling draw event:", error);
        }
    });

    socket.on("clear_canvas", () => {
        try {
            const room = getRoomBySocketId(socket.id);
            if (!room || room.status !== "DRAWING" || room.drawerId !== socket.id) {
                return;
            }

            room.strokes = [];
            room.strokeHistory = [];

            io.to(room.code).emit("clear_canvas");
        } catch (error) {
            console.error("Error clearing canvas:", error);
        }
    });

    socket.on("undo", () => {
        try {
            const room = getRoomBySocketId(socket.id);
            if (!room || room.status !== "DRAWING" || room.drawerId !== socket.id) {
                return;
            }

            if (!room.strokeHistory || room.strokeHistory.length === 0) {
                return;
            }

            // Remove last drawn stroke segment
            room.strokeHistory.pop();
            room.strokes = room.strokeHistory.flat();

            io.to(room.code).emit("clear_canvas");
            if (room.strokes.length > 0) {
                io.to(room.code).emit("draw_batch", room.strokes);
            }
        } catch (error) {
            console.error("Error handling canvas undo:", error);
        }
    });
}
