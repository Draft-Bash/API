import { Server, Socket } from 'socket.io';
import { createServer } from 'http'; // Import the HTTP module
import { DraftTurn } from './utils/draft';

const db = require('./db');

export async function createWebSocket(httpServer: any) {
  // Pass the HTTP server instance to the Socket.io constructor
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow requests from this origin
      methods: ['GET', 'POST'], // Specify the allowed HTTP methods
      allowedHeaders: ['Authorization', 'Content-Type'], // Specify allowed headers
      credentials: true, // Allow credentials (e.g., cookies, authorization headers)
    },
  });

  const draftRoomTimers: Record<string, NodeJS.Timeout | undefined> = {}; // Timers for each draft room
  const remainingTimes: Record<string, number> = {}; // Remaining time for each draft room

  async function startCountdown(roomId: string) {
    if (draftRoomTimers[roomId] !== undefined) {
      clearInterval(draftRoomTimers[roomId]);
    }
    
    const defaultPickTimeInSeconds = 90; // Default pick time duration in seconds
    const remainingTime = remainingTimes[roomId] ?? defaultPickTimeInSeconds;
    const currentDraftOrder = await fetchCurrentDraftOrder(roomId);
    const userDraftTurn = currentDraftOrder[0];
    io.in(roomId).emit('update-draft-turn', userDraftTurn.user_id);

    // Emit the current remaining time to all users in the room
    io.in(roomId).emit('update-clock', remainingTime);

    draftRoomTimers[roomId] = setInterval(async () => {
      if (remainingTimes[roomId] <= 0) {
        // Stop the timer when the remaining time reaches 0
        if (draftRoomTimers[roomId] !== undefined) {
          clearInterval(draftRoomTimers[roomId]);
          remainingTimes[roomId] = defaultPickTimeInSeconds; // Reset the timer to default time
          await db.query(
            `DELETE FROM draft_order 
            WHERE draft_order_id = (SELECT MIN(draft_order_id) FROM draft_order WHERE draft_id = $1)`,
            [roomId]
          );
          const currentDraftOrder = await fetchCurrentDraftOrder(roomId);
          io.in(roomId).emit('send-draft-order', currentDraftOrder);
          startCountdown(roomId); // Restart the countdown timer with default time
        }
      } else {
        remainingTimes[roomId] -= 1; // Decrement the remaining time by 1 second

        // Emit the updated remaining time to all users in the room
        io.in(roomId).emit('update-clock', remainingTimes[roomId]);
      }
    }, 1000); // Update every second
  }

  io.on('connection', (socket: Socket) => {
    let draftOrder: number[] = [];

    socket.on('join-room', async (roomIdParam: string) => {
      const roomId = roomIdParam; // Store the current room ID
      socket.join(roomId); // User joins the socket room for the draft

      // Initialize the remaining time for this room if not already set
      if (!remainingTimes[roomId]) {
        remainingTimes[roomId] = 90; // Set initial remaining time to default
      }

      /* Fetch the current draft order so that it can be sent to the users
      in the draft every time it's updated. */
      const draftOrder = await fetchCurrentDraftOrder(roomId);

      io.in(roomId).emit('send-draft-order', draftOrder);

      // Start the countdown timer when a user joins the draft room
      startCountdown(roomId);

      // Fetch and emit available players to the draft room
      const availablePlayers = await fetchAvailablePlayers(roomId);
      io.in(roomId).emit('receive-available-players', availablePlayers);

      // Emit the current remaining time to the newly joined user
      socket.emit('update-clock', remainingTimes[roomId]);
    });

    socket.on('pick-player', async (playerId: string, userId: string, roomId: string) => {
      try {
        await db.query(
          `INSERT INTO draft_pick (player_id, draft_id, picked_by_user_id, picked_by_bot_number)
          VALUES ($1, $2, $3, $4)`,
          [playerId, roomId, userId, null]
        );
      } catch (error) {
        console.log(error);
      }

      // Reset the countdown timer after a pick
      startCountdown(roomId);

      // Fetch and emit available players to the draft room after a pick
      const availablePlayers = await fetchAvailablePlayers(roomId);
      io.in(roomId).emit('receive-available-players', availablePlayers);
    });
  });
}

async function fetchCurrentDraftOrder(roomId: string) {
    const draftOrderData = await db.query(
        `SELECT username, draft_order_id, U.user_id, 
        draft_id, bot_number, pick_number, is_picked
        FROM draft_order AS O
        LEFT JOIN user_account AS U ON O.user_id = U.user_id
        WHERE draft_id = $1
        LIMIT 20`,
        [roomId]
      );
    return draftOrderData.rows;
}

async function fetchAvailablePlayers(roomId: string) {
  let availablePlayers = await db.query(
    `SELECT * 
    FROM points_draft_ranking AS R
    INNER JOIN nba_player as P
    ON R.player_id = P.player_id
    INNER JOIN nba_player_season_totals AS T
    ON P.player_id = T.player_id
    WHERE R.player_id NOT IN (
      SELECT player_id
      FROM draft_pick
      WHERE draft_id = $1
    )
    ORDER BY R.rank_number;`,
    [roomId]
  );
  return availablePlayers.rows;
}