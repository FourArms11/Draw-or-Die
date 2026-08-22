import UserModel from "../models/User.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";


async function userRegister(req, res) {
    try{
    const { email, username, password } = req.body;

    const isUserAlreadyExists = await UserModel.findOne({ $or: [{ email }, { username }] });

    if (isUserAlreadyExists) {
        return res.status(400).json({ message: "User with this email or username already exists" });
    }

    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    const newUser = await UserModel.create({
        email,
        username,
        passwordHash
    });

    res.status(201).json({ message: "User registered successfully", user: newUser });
    }catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Internal server error" });
    } 
}


export {
    userRegister
};
