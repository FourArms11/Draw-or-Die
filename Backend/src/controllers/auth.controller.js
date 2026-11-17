import UserModel from "../models/User.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { isDbConnected } from "../config/db.js";

const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

async function userRegister(req, res) {
    try {
        if (!isDbConnected()) {
            return res.status(503).json({
                message: "Database service unavailable. Please try again in a moment."
            });
        }

        const email = req.body?.email?.trim().toLowerCase();
        const username = req.body?.username?.trim();
        const password = req.body?.password;

        if (!email || !username || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required"
            });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({
                message: "Username must be between 3 and 20 characters"
            });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({
                message: "Username can only contain letters, numbers, and underscores"
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const isUserAlreadyExists = await UserModel.findOne({
            $or: [{ email }, { username }]
        });

        if (isUserAlreadyExists) {
            const isEmail = isUserAlreadyExists.email.toLowerCase() === email;
            return res.status(409).json({
                message: isEmail ? "User with this email already exists" : "Username is already taken"
            });
        }

        const newUser = await UserModel.create({
            email,
            username,
            passwordHash: password
        });

        const token = jwt.sign(
            { id: newUser._id.toString(), username: newUser.username },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                stats: newUser.stats
            }
        });
    } catch (error) {
        console.error("Error during user registration:", error);
        return res.status(500).json({ message: "Internal server error during registration" });
    }
}

async function userLogin(req, res) {
    try {
        if (!isDbConnected()) {
            return res.status(503).json({
                message: "Database service unavailable. Please try again in a moment."
            });
        }

        const identifier = (req.body?.identifier ?? req.body?.email ?? req.body?.username ?? "").trim();
        const password = req.body?.password;

        if (!identifier || !password) {
            return res.status(400).json({
                message: "Username/email and password are required"
            });
        }

        const user = await UserModel.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier }
            ]
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email/username or password"
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email/username or password"
            });
        }

        const token = jwt.sign(
            { id: user._id.toString(), username: user.username },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                stats: user.stats
            }
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            message: "Internal server error during login"
        });
    }
}

function userLogout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
        message: "User logged out successfully"
    });
}

async function getMe(req, res) {
    try {
        if (!isDbConnected()) {
            return res.status(503).json({
                message: "Database service unavailable. Please try again in a moment."
            });
        }

        const user = await UserModel.findById(req.user.id).select("-passwordHash");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                stats: user.stats
            }
        });
    } catch (error) {
        console.error("GET_ME ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch user session" });
    }
}

export {
    userRegister,
    userLogin,
    userLogout,
    getMe
};
