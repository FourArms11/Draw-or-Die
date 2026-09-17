import { Server } from 'socket.io'

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ['GET', 'POST'],
        },
    });

    io.use((socket, next) => { //use middleware to authenticate the socket connection
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: Token not provided'));
        }

        next();
    });


    io.on('connection', (socket) => { // Handle socket connection
        console.log(`User connected: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
}

export const getIO = () => { // Function to get the initialized Socket.IO instance
    if(!io){
        throw new Error('Socket.io instance not initialized');
    }
    return io;
}