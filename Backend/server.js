import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import config from "./src/config/config.js";
import dns from "dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);
import { initSocket } from "./src/sockets/index.js";

const PORT = config.PORT || 3000;

const server = http.createServer(app);
initSocket(server);

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
});


