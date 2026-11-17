import { getRoomBySocketId } from "../game/RoomManager.js";
import { handleGuess } from "../game/GameStateManager.js";

const RATE_LIMIT_MS = 350;

export function registerChatHandlers(io, socket) {
    socket.on("send_message", (rawMessage) => {
        try {
            const room = getRoomBySocketId(socket.id);
            if (!room) return;

            const player = room.players.get(socket.id);
            if (!player) return;

            const text = String(rawMessage || "").trim().slice(0, 100);
            if (!text) return;

            const now = Date.now();
            if (now - (player.lastMessageTime || 0) < RATE_LIMIT_MS) {
                return; // rate limited
            }
            player.lastMessageTime = now;

            const isDrawing = room.status === "DRAWING";

            if (isDrawing) {
                // If it's a correct guess, handleGuess processes it and broadcasts system announcement
                const guessResult = handleGuess(io, socket, room, text);
                if (guessResult.isGuess && guessResult.correct) {
                    return; // Don't broadcast the actual word in the chat stream
                }

                // If player is the drawer or has already guessed correctly,
                // send message privately only to others who know the word to avoid spoilers
                const knowsWord = socket.id === room.drawerId || player.guessed;
                if (knowsWord) {
                    const privateMsg = {
                        name: player.name,
                        text,
                        hidden: true,
                    };

                    room.players.forEach((otherPlayer, id) => {
                        if (id === room.drawerId || otherPlayer.guessed) {
                            io.to(id).emit("chat_message", privateMsg);
                        }
                    });
                    return;
                }
            }

            // Normal room-isolated broadcast
            io.to(room.code).emit("chat_message", {
                name: player.name,
                text,
            });
        } catch (error) {
            console.error("Error handling chat message:", error);
        }
    });
}
