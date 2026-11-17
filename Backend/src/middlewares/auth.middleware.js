import jwt from "jsonwebtoken";
import config from "../config/config.js";

export function parseCookies(cookieHeader = "") {
    const list = {};
    if (!cookieHeader) return list;

    cookieHeader.split(";").forEach((cookie) => {
        const parts = cookie.split("=");
        if (parts.length >= 2) {
            const key = parts.shift().trim();
            const val = decodeURIComponent(parts.join("=").trim());
            list[key] = val;
        }
    });

    return list;
}

export function verifyToken(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, config.JWT_SECRET);
    } catch {
        return null;
    }
}

export function authenticateUser(req, res, next) {
    const token =
        req.cookies?.token ||
        (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, ""));

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired session. Please log in again." });
    }

    req.user = decoded;
    next();
}
