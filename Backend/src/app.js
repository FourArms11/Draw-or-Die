import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import config from "./config/config.js";
import { isDbConnected } from "./config/db.js";

const app = express();

const allowedOrigins = [
    config.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
                callback(null, true);
                return;
            }
            callback(new Error(`Blocked by CORS: ${origin}`));
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        database: isDbConnected() ? "connected" : "disconnected",
        uptime: process.uptime(),
    });
});

export default app;