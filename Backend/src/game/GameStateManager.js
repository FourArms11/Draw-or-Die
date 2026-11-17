import { getRandomWord, maskWord } from "./wordBank.js";
import { calculateGuesserScore, calculateDrawerScore, rankPlayers } from "./scoring.js";
import { syncRoomState, serializeRoom } from "./RoomManager.js";
import MatchModel from "../models/Match.model.js";
import UserModel from "../models/User.model.js";
import { isDbConnected } from "../config/db.js";

function shuffle(items) {
    for (let index = items.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
    }
    return items;
}

export function startGame(io, socket, room) {
    if (!room) return { error: "Room not found" };
    if (room.host !== socket.id) return { error: "Only the room host can start the game" };
    if (room.status !== "WAITING" && room.status !== "GAME_OVER") return { error: "Game already in progress" };
    if (room.players.size < 2) return { error: "At least 2 players are required to start" };

    // Reset scores and prepare turn order
    room.players.forEach((p) => {
        p.score = 0;
        p.guessed = false;
    });

    room.order = shuffle(Array.from(room.players.keys()));
    room.turnIndex = 0;
    room.currentRound = 1;
    room.usedWords.clear();

    startTurn(io, room);
    return { ok: true };
}

export function startTurn(io, room) {
    if (!room) return;

    if (room.turnIndex >= room.order.length) {
        room.turnIndex = 0;
        room.currentRound++;
    }

    if (room.currentRound > room.settings.rounds || room.players.size < 2) {
        return endGame(io, room, room.players.size < 2 ? "Not enough players" : "All rounds completed");
    }

    const drawerSocketId = room.order[room.turnIndex];
    const drawerPlayer = room.players.get(drawerSocketId);
    if (!drawerPlayer) {
        // Drawer missing, advance to next player
        room.turnIndex++;
        return startTurn(io, room);
    }

    room.drawerId = drawerSocketId;
    room.word = getRandomWord(room.usedWords);
    room.usedWords.add(room.word);
    room.maskedWord = maskWord(room.word);
    room.status = "DRAWING";
    room.timeRemaining = room.settings.time;
    room.strokes = [];
    room.strokeHistory = [];

    room.players.forEach((p) => {
        p.guessed = false;
    });

    syncRoomState(io, room);
    io.to(room.code).emit("clear_canvas");

    // Send masked hint to room
    io.to(room.code).emit("turn_started", {
        hint: room.maskedWord,
        time: room.timeRemaining,
        drawerId: room.drawerId,
        drawerName: drawerPlayer.name,
    });

    // Send the actual secret word ONLY to the drawer
    io.to(room.drawerId).emit("your_word", {
        word: room.word,
    });

    io.to(room.code).emit("chat_message", {
        system: true,
        text: `${drawerPlayer.name} is now drawing!`,
    });

    if (room.timer) clearInterval(room.timer);
    room.timer = setInterval(() => {
        room.timeRemaining--;
        io.to(room.code).emit("timer_update", room.timeRemaining);

        if (room.timeRemaining <= 0) {
            endTurn(io, room, "Time's up!");
        }
    }, 1000);
}

export function endTurn(io, room, reason = "Round ended") {
    if (!room || room.status !== "DRAWING") return;

    if (room.timer) {
        clearInterval(room.timer);
        room.timer = null;
    }

    room.status = "ROUND_END";
    room.turnIndex++;

    syncRoomState(io, room);

    io.to(room.code).emit("round_ended", {
        word: room.word,
        reason,
        scores: Array.from(room.players.values()).map(p => ({ id: p.id, name: p.name, score: p.score })),
    });

    io.to(room.code).emit("chat_message", {
        system: true,
        text: `${reason}. The word was "${room.word}".`,
    });

    if (room.nextTurnTimeout) clearTimeout(room.nextTurnTimeout);
    room.nextTurnTimeout = setTimeout(() => {
        startTurn(io, room);
    }, 4000);
}

export async function endGame(io, room, reason = "Game completed") {
    if (!room) return;

    if (room.timer) {
        clearInterval(room.timer);
        room.timer = null;
    }
    if (room.nextTurnTimeout) {
        clearTimeout(room.nextTurnTimeout);
        room.nextTurnTimeout = null;
    }

    room.status = "GAME_OVER";
    room.drawerId = null;

    const ranking = rankPlayers(Array.from(room.players.values())).map((p, index) => ({
        id: p.id,
        userId: p.userId,
        name: p.name,
        score: p.score,
        rank: index + 1,
    }));

    io.to(room.code).emit("game_ended", {
        reason,
        leaderboard: ranking,
    });

    io.to(room.code).emit("chat_message", {
        system: true,
        text: `Game over! ${ranking[0]?.name || "Winner"} wins with ${ranking[0]?.score || 0} points!`,
    });

    syncRoomState(io, room);

    // Save match and update user stats in MongoDB if available
    if (isDbConnected() && ranking.length > 0 && ranking.some(p => p.score > 0)) {
        try {
            const winner = ranking[0];
            await MatchModel.create({
                roomCode: room.code,
                rounds: room.settings.rounds,
                players: ranking.map(p => ({
                    userId: p.userId || null,
                    username: p.name,
                    score: p.score,
                    rank: p.rank,
                })),
                winnerUserId: winner.userId || null,
            });

            await Promise.all(
                ranking.map(async (p, idx) => {
                    if (p.userId) {
                        await UserModel.findByIdAndUpdate(p.userId, {
                            $inc: {
                                "stats.gamePlayed": 1,
                                "stats.totalScore": p.score,
                                "stats.gameWon": idx === 0 && p.score > 0 ? 1 : 0,
                            },
                        });
                    }
                })
            );
        } catch (dbError) {
            console.error("Failed to save match results:", dbError.message);
        }
    }
}

export function handleGuess(io, socket, room, messageText) {
    if (!room || room.status !== "DRAWING") return { isGuess: false };

    const player = room.players.get(socket.id);
    if (!player) return { isGuess: false };

    // Drawer cannot guess their own word
    if (socket.id === room.drawerId) {
        return { isGuess: false, isDrawer: true };
    }

    // Player already guessed correctly
    if (player.guessed) {
        return { isGuess: false, alreadyGuessed: true };
    }

    const cleanMessage = String(messageText || "").trim().toLowerCase();
    const targetWord = String(room.word || "").trim().toLowerCase();

    if (cleanMessage === targetWord) {
        player.guessed = true;

        const guessScore = calculateGuesserScore(room.timeRemaining, room.settings.time);
        player.score += guessScore;

        const drawer = room.players.get(room.drawerId);
        if (drawer) {
            drawer.score += calculateDrawerScore();
        }

        io.to(room.code).emit("chat_message", {
            system: true,
            text: `${player.name} guessed the word! (+${guessScore} pts)`,
        });

        syncRoomState(io, room);

        const guessers = Array.from(room.players.values()).filter((p) => p.id !== room.drawerId);
        const allGuessed = guessers.length > 0 && guessers.every((p) => p.guessed);

        if (allGuessed) {
            endTurn(io, room, "Everyone guessed the word!");
        }

        return { isGuess: true, correct: true };
    }

    return { isGuess: false };
}

export function handleLeaveGameCheck(io, leaveResult) {
    if (!leaveResult || leaveResult.roomDestroyed) return;
    const { room, wasDrawer } = leaveResult;

    if (wasDrawer && room.status === "DRAWING") {
        endTurn(io, room, "The drawer left the game");
    } else if (room.status !== "WAITING" && room.status !== "GAME_OVER" && room.players.size < 2) {
        endGame(io, room, "Not enough players to continue");
    }
}
