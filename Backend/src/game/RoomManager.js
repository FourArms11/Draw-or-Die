import { maskWord } from "./wordBank.js";

const rooms = new Map(); // roomCode -> Room
const socketToRoom = new Map(); // socketId -> roomCode

export const DEFAULT_SETTINGS = {
    rounds: 3,
    time: 60,
    players: 8,
};

export const MAX_PLAYERS_LIMIT = 12;
export const MAX_ROUNDS_LIMIT = 10;
export const MAX_TIME_LIMIT = 180;
export const MIN_TIME_LIMIT = 20;

export function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code;
    do {
        code = "";
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (rooms.has(code));
    return code;
}

export function sanitizeName(name) {
    const trimmed = String(name || "").trim().slice(0, 20);
    return trimmed || "Player";
}

export function getRoom(code) {
    if (!code) return null;
    return rooms.get(String(code).trim().toUpperCase());
}

export function getRoomBySocketId(socketId) {
    const code = socketToRoom.get(socketId);
    return code ? rooms.get(code) : null;
}

export function serializeRoom(room) {
    if (!room) return null;

    const playersList = Array.from(room.players.values()).map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        guessed: p.guessed,
        isHost: p.id === room.host,
    }));

    return {
        code: room.code,
        host: room.host,
        status: room.status,
        round: room.currentRound,
        maxRounds: room.settings.rounds,
        roundTime: room.settings.time,
        playerLimit: room.settings.players,
        drawerId: room.drawerId,
        timeRemaining: room.timeRemaining,
        players: playersList,
        hint: room.status === "DRAWING" ? room.maskedWord : "",
    };
}

export function syncRoomState(io, room) {
    if (!room || !io) return;
    io.to(room.code).emit("room_state", serializeRoom(room));
}

export function createRoom({ socket, user, settings = {} }) {
    const code = generateRoomCode();
    const playerName = user?.username ? user.username : sanitizeName(socket.data?.name || "Host");

    const validatedSettings = {
        rounds: Math.min(MAX_ROUNDS_LIMIT, Math.max(1, parseInt(settings.rounds, 10) || DEFAULT_SETTINGS.rounds)),
        time: Math.min(MAX_TIME_LIMIT, Math.max(MIN_TIME_LIMIT, parseInt(settings.time, 10) || DEFAULT_SETTINGS.time)),
        players: Math.min(MAX_PLAYERS_LIMIT, Math.max(2, parseInt(settings.players, 10) || DEFAULT_SETTINGS.players)),
    };

    const room = {
        code,
        host: socket.id,
        hostUserId: user?.id || null,
        status: "WAITING",
        settings: validatedSettings,
        players: new Map(),
        order: [],
        turnIndex: 0,
        currentRound: 1,
        drawerId: null,
        word: "",
        maskedWord: "",
        strokes: [],
        strokeHistory: [],
        timeRemaining: 0,
        timer: null,
        nextTurnTimeout: null,
        usedWords: new Set(),
        createdAt: Date.now(),
        lastActivity: Date.now(),
    };

    room.players.set(socket.id, {
        id: socket.id,
        userId: user?.id || null,
        name: playerName,
        score: 0,
        guessed: false,
        isHost: true,
        lastMessageTime: 0,
    });

    rooms.set(code, room);
    socketToRoom.set(socket.id, code);
    socket.data.roomCode = code;
    socket.join(code);

    return room;
}

export function joinRoom({ socket, user, code }) {
    const normalizedCode = String(code || "").trim().toUpperCase();
    const room = rooms.get(normalizedCode);

    if (!room) {
        return { error: "Room not found. Check the code and try again." };
    }

    if (room.players.size >= room.settings.players) {
        return { error: "Room is full." };
    }

    if (room.status !== "WAITING" && room.status !== "DRAWING" && room.status !== "ROUND_END") {
        return { error: "This game has already finished or closed." };
    }

    const playerName = user?.username ? user.username : sanitizeName(socket.data?.name || `Player ${room.players.size + 1}`);

    // Check duplicate username in room
    let finalName = playerName;
    const existingNames = new Set(Array.from(room.players.values()).map(p => p.name.toLowerCase()));
    if (existingNames.has(finalName.toLowerCase())) {
        let counter = 2;
        while (existingNames.has(`${playerName} (${counter})`.toLowerCase())) {
            counter++;
        }
        finalName = `${playerName} (${counter})`;
    }

    room.players.set(socket.id, {
        id: socket.id,
        userId: user?.id || null,
        name: finalName,
        score: 0,
        guessed: false,
        isHost: false,
        lastMessageTime: 0,
    });

    socketToRoom.set(socket.id, room.code);
    socket.data.roomCode = room.code;
    socket.join(room.code);
    room.lastActivity = Date.now();

    // If game is in progress, add to order for subsequent turns
    if (room.status === "DRAWING" || room.status === "ROUND_END") {
        if (!room.order.includes(socket.id)) {
            room.order.push(socket.id);
        }
    }

    return { room, name: finalName };
}

export function removePlayerFromRoom(socketId) {
    const code = socketToRoom.get(socketId);
    if (!code) return null;

    const room = rooms.get(code);
    socketToRoom.delete(socketId);

    if (!room) return null;

    const player = room.players.get(socketId);
    room.players.delete(socketId);
    room.lastActivity = Date.now();

    const wasDrawer = room.drawerId === socketId;

    // Remove from turn order
    const orderIndex = room.order.indexOf(socketId);
    if (orderIndex !== -1) {
        room.order.splice(orderIndex, 1);
        if (orderIndex < room.turnIndex || wasDrawer) {
            room.turnIndex = Math.max(0, room.turnIndex - 1);
        }
    }

    // If room is empty, clean up
    if (room.players.size === 0) {
        if (room.timer) clearInterval(room.timer);
        if (room.nextTurnTimeout) clearTimeout(room.nextTurnTimeout);
        rooms.delete(code);
        return { room, player, roomDestroyed: true, wasDrawer };
    }

    // Host reassignment if host left
    if (room.host === socketId) {
        const nextHostId = room.players.keys().next().value;
        room.host = nextHostId;
        const nextHostPlayer = room.players.get(nextHostId);
        if (nextHostPlayer) {
            nextHostPlayer.isHost = true;
        }
    }

    return { room, player, roomDestroyed: false, wasDrawer };
}

export function cleanupAbandonedRooms() {
    const now = Date.now();
    const TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
    for (const [code, room] of rooms.entries()) {
        if (now - room.lastActivity > TIMEOUT || room.players.size === 0) {
            if (room.timer) clearInterval(room.timer);
            if (room.nextTurnTimeout) clearTimeout(room.nextTurnTimeout);
            rooms.delete(code);
        }
    }
}

// Periodic cleanup every 15 minutes
setInterval(cleanupAbandonedRooms, 15 * 60 * 1000);

export { rooms, socketToRoom };
