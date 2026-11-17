import { createRoom, joinRoom, removePlayerFromRoom, syncRoomState, getRoomBySocketId } from "../game/RoomManager.js";
import { handleLeaveGameCheck } from "../game/GameStateManager.js";

export function registerRoomHandlers(io, socket) {
    socket.on("create_room", (payload = {}, ack) => {
        try {
            const existingRoom = getRoomBySocketId(socket.id);
            if (existingRoom) {
                const leaveResult = removePlayerFromRoom(socket.id);
                if (leaveResult && !leaveResult.roomDestroyed) {
                    syncRoomState(io, leaveResult.room);
                    handleLeaveGameCheck(io, leaveResult);
                }
            }

            const room = createRoom({
                socket,
                user: socket.data?.user || null,
                settings: payload.settings || {},
            });

            syncRoomState(io, room);

            if (typeof ack === "function") {
                ack({ ok: true, roomCode: room.code });
            }
        } catch (error) {
            console.error("Error creating room:", error);
            if (typeof ack === "function") {
                ack({ error: "Failed to create room. Please try again." });
            }
        }
    });

    socket.on("join_room", (payload = {}, ack) => {
        try {
            const code = payload.code || payload.roomCode;
            if (!code) {
                if (typeof ack === "function") ack({ error: "Room code is required" });
                return;
            }

            const existingRoom = getRoomBySocketId(socket.id);
            if (existingRoom && existingRoom.code === code.trim().toUpperCase()) {
                if (typeof ack === "function") ack({ ok: true, roomCode: existingRoom.code });
                return;
            } else if (existingRoom) {
                const leaveResult = removePlayerFromRoom(socket.id);
                if (leaveResult && !leaveResult.roomDestroyed) {
                    syncRoomState(io, leaveResult.room);
                    handleLeaveGameCheck(io, leaveResult);
                }
            }

            const result = joinRoom({
                socket,
                user: socket.data?.user || null,
                code,
            });

            if (result.error) {
                if (typeof ack === "function") ack({ error: result.error });
                return;
            }

            const { room, name } = result;

            syncRoomState(io, room);

            io.to(room.code).emit("chat_message", {
                system: true,
                text: `${name} joined the room.`,
            });

            // If game is already DRAWING, catch up the newly joined player
            if (room.status === "DRAWING") {
                socket.emit("turn_started", {
                    hint: room.maskedWord,
                    time: room.timeRemaining,
                    drawerId: room.drawerId,
                });

                if (room.strokes && room.strokes.length > 0) {
                    socket.emit("draw_batch", room.strokes);
                }
            }

            if (typeof ack === "function") {
                ack({ ok: true, roomCode: room.code });
            }
        } catch (error) {
            console.error("Error joining room:", error);
            if (typeof ack === "function") {
                ack({ error: "Failed to join room" });
            }
        }
    });

    socket.on("leave_room", (ack) => {
        try {
            const leaveResult = removePlayerFromRoom(socket.id);
            if (leaveResult) {
                socket.leave(leaveResult.room?.code);
                if (!leaveResult.roomDestroyed) {
                    syncRoomState(io, leaveResult.room);
                    io.to(leaveResult.room.code).emit("chat_message", {
                        system: true,
                        text: `${leaveResult.player?.name || "A player"} left the game.`,
                    });
                    handleLeaveGameCheck(io, leaveResult);
                }
            }
            if (typeof ack === "function") ack({ ok: true });
        } catch (error) {
            console.error("Error leaving room:", error);
            if (typeof ack === "function") ack({ error: "Failed to leave room" });
        }
    });

    socket.on("disconnect", () => {
        try {
            const leaveResult = removePlayerFromRoom(socket.id);
            if (leaveResult && !leaveResult.roomDestroyed) {
                syncRoomState(io, leaveResult.room);
                io.to(leaveResult.room.code).emit("chat_message", {
                    system: true,
                    text: `${leaveResult.player?.name || "A player"} disconnected.`,
                });
                handleLeaveGameCheck(io, leaveResult);
            }
        } catch (error) {
            console.error("Error handling disconnect in room handler:", error);
        }
    });
}
