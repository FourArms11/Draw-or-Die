import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import config from "./src/config/config.js";
import { initSocket } from "./src/sockets/index.js";

const PORT = config.PORT || 3000;

const server = http.createServer(app);
initSocket(server);

connectDB()
    .catch((error) => {
        console.warn("Database connection issue (running with in-memory multiplayer):", error.message);
    })
    .finally(() => {
        server.listen(PORT, () => {
            console.log(`Draw or Die server is running on port ${PORT}`);
        });
    });

export default server;
