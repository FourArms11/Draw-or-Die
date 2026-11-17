import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    playedAt: {
        type: Date,
        default: Date.now,
    },
    rounds: {
        type: Number,
        default: 3,
    },
    players: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },
            username: {
                type: String,
                required: true,
            },
            score: {
                type: Number,
                default: 0,
            },
            rank: {
                type: Number,
                default: 1,
            },
        },
    ],
    winnerUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
});

matchSchema.index({ "players.userId": 1 });
matchSchema.index({ playedAt: -1 });

const MatchModel = mongoose.model("Match", matchSchema);

export default MatchModel;
