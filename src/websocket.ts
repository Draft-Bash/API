import { Server, Socket } from 'socket.io';
import { createServer } from 'http'; // Import the HTTP module

const db = require('./db');

export async function createWebSocket(portNumber: string) {

    // Create an HTTP server
    const httpServer = createServer();

    // Pass the HTTP server instance to the Socket.io constructor
    const io = new Server(httpServer, {
    cors: {
        origin: '*', // Allow requests from this origin
        methods: ['GET', 'POST'], // Specify the allowed HTTP methods
        allowedHeaders: ['Authorization', 'Content-Type'], // Specify allowed headers
        credentials: true, // Allow credentials (e.g., cookies, authorization headers)
    },
    });

    io.on('connection', (socket: Socket) => {
    let draftOrder: number[] = [];

    socket.on('join-room', async (roomId: string) => {
        socket.join(roomId);

        const draftOrderData = await db.query(
        `SELECT username, draft_order_id, U.user_id, 
        draft_id, bot_number, pick_number, is_picked
        FROM draft_order AS O
        LEFT JOIN user_account AS U ON O.user_id = U.user_id
        WHERE draft_id = $1
        LIMIT 15`,
        [roomId]
        );
        draftOrder = draftOrderData.rows;

        io.in(roomId).emit('send-draft-order', draftOrder);

        const timeData = await db.query("SELECT pick_time_seconds FROM draft WHERE draft_id = $1", [
        roomId
        ]);
    });

    socket.on('disconnecting', () => {
    });

    socket.on('send-message', (message: string, roomId: string) => {
        socket.to(roomId).emit('receive-message', message);
    });

    socket.on('send-players', (players: any, roomId: string) => {
        socket.broadcast.to(roomId).emit('receive-message', players);
    });
    });

    httpServer.listen(portNumber, () => {
        console.log(`WebSocket server is running on port ${portNumber}`);
    });
}