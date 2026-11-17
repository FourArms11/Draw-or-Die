import { Server } from "socket.io";
import config from "../config/config.js";
import { parseCookies, verifyToken } from "../middlewares/auth.middleware.js";
import { registerRoomHandlers } from "./roomHandlers.js";
import { registerGameHandlers } from "./gameHandlers.js";
import { registerDrawHandlers } from "./drawHandlers.js";
import { registerChatHandlers } from "./chatHandlers.js";

let io;
const activeUserSockets = new Map(); // userId -> socket

export const initSocket = (server) => {
    const allowedOrigins = [
        config.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ].filter(Boolean);

    io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
                    callback(null, true);
                    return;
                }
                callback(null, true); // Permissive for local testing
            },
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // Socket.IO authentication middleware
    io.use((socket, next) => {
        try {
            let token = socket.handshake.auth?.token;

            // Fallback: extract token from cookie header
            if (!token && socket.handshake.headers?.cookie) {
                const cookies = parseCookies(socket.handshake.headers.cookie);
                token = cookies.token;
            }

            if (token) {
                const decoded = verifyToken(token);
                if (decoded) {
                    socket.data.user = {
                        id: decoded.id,
                        username: decoded.username,
                    };
                }
            }

            // Also check for explicit username passed in auth (for guest or display name fallback)
            if (!socket.data.user && socket.handshake.auth?.username) {
                socket.data.name = String(socket.handshake.auth.username).trim().slice(0, 20);
            }

            next();
        } catch (error) {
            console.error("Socket auth error:", error);
            next();
        }
    });

    io.on("connection", (socket) => {
        const user = socket.data?.user;
        const displayName = user?.username || socket.data?.name || "Guest";

        console.log(`[Socket] Connected: ${socket.id} (${displayName})`);

        // Handle duplicate login per account safely
        if (user?.id) {
            const previousSocket = activeUserSockets.get(user.id);
            if (previousSocket && previousSocket.id !== socket.id) {
                previousSocket.emit("kicked", { message: "You connected in another browser tab." });
                previousSocket.disconnect(true);
            }
            activeUserSockets.set(user.id, socket);

            socket.on("disconnect", () => {
                if (activeUserSockets.get(user.id) === socket) {
                    activeUserSockets.delete(user.id);
                }
            });
        }

        // Register event handler modules
        registerRoomHandlers(io, socket);
        registerGameHandlers(io, socket);
        registerDrawHandlers(io, socket);
        registerChatHandlers(io, socket);

        socket.on("disconnect", (reason) => {
            console.log(`[Socket] Disconnected: ${socket.id} (${reason})`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io instance not initialized");
    }
    return io;
};