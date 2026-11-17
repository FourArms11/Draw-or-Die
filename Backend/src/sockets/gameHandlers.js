import { getRoomBySocketId, syncRoomState, MAX_PLAYERS_LIMIT, MAX_ROUNDS_LIMIT, MAX_TIME_LIMIT, MIN_TIME_LIMIT } from "../game/RoomManager.js";
import { startGame } from "../game/GameStateManager.js";

export function registerGameHandlers(io, socket) {
    socket.on("start_game", (ack) => {
        try {
            const room = getRoomBySocketId(socket.id);
            if (!room) {
                if (typeof ack === "function") ack({ error: "You are not in a room" });
                return;
            }

            const result = startGame(io, socket, room);
            if (result.error) {
                if (typeof ack === "function") ack({ error: result.error });
                socket.emit("game_error", { message: result.error });
                return;
            }

            if (typeof ack === "function") ack({ ok: true });
        } catch (error) {
            console.error("Error starting game:", error);
            if (typeof ack === "function") ack({ error: "Failed to start game" });
        }
    });

    socket.on("update_settings", (newSettings = {}, ack) => {
        try {
            const room = getRoomBySocketId(socket.id);
            if (!room) return;
            if (room.host !== socket.id) {
                if (typeof ack === "function") ack({ error: "Only the host can modify settings" });
                return;
            }
            if (room.status !== "WAITING") {
                if (typeof ack === "function") ack({ error: "Cannot modify settings while game is in progress" });
                return;
            }

            if (newSettings.rounds !== undefined) {
                room.settings.rounds = Math.min(MAX_ROUNDS_LIMIT, Math.max(1, parseInt(newSettings.rounds, 10) || room.settings.rounds));
            }
            if (newSettings.time !== undefined) {
                room.settings.time = Math.min(MAX_TIME_LIMIT, Math.max(MIN_TIME_LIMIT, parseInt(newSettings.time, 10) || room.settings.time));
            }
            if (newSettings.players !== undefined) {
                room.settings.players = Math.min(MAX_PLAYERS_LIMIT, Math.max(2, parseInt(newSettings.players, 10) || room.settings.players));
            }

            syncRoomState(io, room);
            if (typeof ack === "function") ack({ ok: true, settings: room.settings });
        } catch (error) {
            console.error("Error updating settings:", error);
        }
    });
}
