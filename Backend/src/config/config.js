import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined in the environment variables.");
    process.exit(1);
}

if (!process.env.PORT) {
    console.error("PORT is not defined in the environment variables.");
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in the environment variables.");
    process.exit(1);
}


const config = {
    JWT_SECRET: process.env.JWT_SECRET,
    MONGO_URI: process.env.MONGO_URI,
    PORT: Number(process.env.PORT) || 3000,
    FRONTEND_URL: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "http://localhost:5173",
    NODE_ENV: process.env.NODE_ENV || "development",
};

export default config;