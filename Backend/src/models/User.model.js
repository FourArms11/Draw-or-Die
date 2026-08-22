import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    stats: {
        gamePlayed: {
            type: Number,
            default: 0
        },
        gameWon: {
            type: Number,
            default: 0
        },
        totalScore: {
            type: Number,
            default: 0
        }
    }
});



const UserModel = mongoose.model("User", userSchema);

export default UserModel;