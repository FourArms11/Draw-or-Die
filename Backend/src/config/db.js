import mongoose from "mongoose";
import config from "./config.js";   

let isConnected = false;

async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_URI);
        isConnected = true;
        console.log("MongoDB connected successfully");
    } catch (error) {
        isConnected = false;
        console.error("MongoDB connection error:", error.message);
        throw error;
    }
}

mongoose.connection.on("connected", () => {
    isConnected = true;
});

mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.warn("MongoDB disconnected");
});

export const isDbConnected = () => isConnected || mongoose.connection.readyState === 1;

export default connectDB;