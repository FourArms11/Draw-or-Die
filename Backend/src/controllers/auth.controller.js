import UserModel from "../models/User.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";


async function userRegister(req, res) {
    try{
    const { email, username, password } = req.body;

    const isUserAlreadyExists = await UserModel.findOne({ $or: [{ email }, { username }] });

    if (isUserAlreadyExists) {
        return res.status(400).json({ message: "User with this email or username already exists" });
    }

    const newUser = await UserModel.create({
        email,
        username,
        passwordHash: password
    });



    res.status(201).json({ message: "User registered successfully", user: newUser });
    }catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Internal server error" });
    } 
}


async function userLogin(req, res) {
    const { identifier, password } = req.body;

    try {


        if (!identifier || !password) {
            return res.status(400).json({
                message: "Username/email and password are required"
            });
        }



        const user = await UserModel.findOne({
            $or: [
                { email: identifier },
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
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );


        return res
            .status(200)
            .cookie("token", token, {
                httpOnly: true
            })
            .json({
                message: "User logged in successfully"
            });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
async function userLogout(req, res) {
    res.clearCookie("token").status(200).json({ message: "User logged out successfully" });
}


export {
    userRegister,
    userLogin
};

