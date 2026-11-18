import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
        },
        correctGuesses: {
            type: Number,
            default: 0
        }
    }
});

userSchema.pre("save", async function () {
    if (this.isModified("passwordHash")) {
        this.passwordHash = await bcrypt.hash(
            this.passwordHash,
            10
        );
    }
});


userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(
        candidatePassword,
        this.passwordHash
    );
};





const UserModel = mongoose.model("User", userSchema);

export default UserModel;