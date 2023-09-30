import { Server, Socket } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import { DraftTurn, fetchRoster } from './utils/draft';
import {
  fetchAvailablePlayers,
  fetchCurrentDraftOrder,
  fetchDraftSettings,
} from './utils/draft';
import { autoDraft } from './utils/autoDraft';
import { Pool, QueryResult } from 'pg';
const db = require('./db');

// Define interfaces for draft room timers and remaining times.
interface DraftRoomTimers {
  [roomId: string]: NodeJS.Timeout | undefined;
}

interface RemainingTimes {
  [roomId: string]: number;
}

export async function createWebSocket(httpServer: HttpServer) {
  const io: Server = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      credentials: true,
    },
  });

  const draftRoomTimers: DraftRoomTimers = {}; // Timers for each draft room
  const remainingTimes: RemainingTimes = {}; // Remaining time for each draft room
  let isAutodraftOn = false;

  async function startCountdown(roomId: string) {
    if (draftRoomTimers[roomId] !== undefined) {
      clearInterval(draftRoomTimers[roomId]);
    }

    const draftSettings = await fetchDraftSettings(roomId); // Default pick time duration in seconds
    const defaultPickTimeInSeconds = draftSettings.pick_time_seconds;
    let remainingTime = remainingTimes[roomId] ?? defaultPickTimeInSeconds;
    const currentDraftOrder = await fetchCurrentDraftOrder(roomId);
    const userDraftTurn = currentDraftOrder[0];

    if (currentDraftOrder.length > 0) {
      io.in(roomId).emit('update-draft-turn', userDraftTurn.user_id);

      // Emit the current remaining time to all users in the room
      io.in(roomId).emit('update-clock', remainingTime);

      draftRoomTimers[roomId] = setInterval(async () => {
        if (currentDraftOrder[0].bot_number) {
          await autoDraft(null, currentDraftOrder[0].bot_number, roomId);
          const newDraftOrder = await fetchCurrentDraftOrder(roomId);
          const currentAvailablePlayers = await fetchAvailablePlayers(roomId);
          io.in(roomId).emit('send-draft-order', newDraftOrder);
          io.in(roomId).emit('receive-available-players', currentAvailablePlayers);
          clearInterval(draftRoomTimers[roomId]);
          remainingTimes[roomId] = defaultPickTimeInSeconds;
          startCountdown(roomId);
        }
        if (remainingTimes[roomId] <= 0 || isAutodraftOn) {
          // Stop the timer when the remaining time reaches 0
          if (draftRoomTimers[roomId] !== undefined) {
            clearInterval(draftRoomTimers[roomId]);
            remainingTimes[roomId] = defaultPickTimeInSeconds; // Reset the timer to default time

            await autoDraft(userDraftTurn.user_id, null, roomId);
            const roster = await fetchRoster(roomId, userDraftTurn.user_id);

            isAutodraftOn = true;
            io.in(roomId).emit('autodraft-enabled', userDraftTurn.user_id);
            io.in(roomId).emit('update-roster', { players: roster, userId: userDraftTurn.user_id });

            const currentAvailablePlayers = await fetchAvailablePlayers(roomId);
            io.in(roomId).emit('receive-available-players', currentAvailablePlayers);

            const newDraftOrder = await fetchCurrentDraftOrder(roomId);
            io.in(roomId).emit('send-draft-order', newDraftOrder);

            startCountdown(roomId); // Restart the countdown timer with default time
          }
        } else {
          remainingTimes[roomId] -= 1; // Decrement the remaining time by 1 second

          // Emit the updated remaining time to all users in the room
          io.in(roomId).emit('update-clock', remainingTimes[roomId]);
        }
      }, 1000); // Update every second
    } else {
      console.log('The draft is over.');
      return;
    }
  }

  io.on('connection', (socket: Socket) => {
    let draftOrder: number[] = [];

    socket.on('join-room', async (roomIdParam: string) => {
      const roomId = roomIdParam; // Store the current room ID
      socket.join(roomId); // User joins the socket room for the draft
      const draftSettings = await fetchDraftSettings(roomId); // Default pick time duration in seconds
      const defaultPickTimeInSeconds = draftSettings.pick_time_seconds;

      // Initialize the remaining time for this room if not already set
      if (!remainingTimes[roomId]) {
        remainingTimes[roomId] = defaultPickTimeInSeconds; // Set initial remaining time to default
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

    socket.on('update-autodraft', (isAuto: boolean) => {
      isAutodraftOn = isAuto;
    });

    socket.on(
      'pick-player',
      async (playerId: string, userId: string, roomId: string) => {
        try {
          await db.query(
            `INSERT INTO draft_pick (player_id, draft_id, picked_by_user_id, picked_by_bot_number)
          VALUES ($1, $2, $3, $4)`,
            [playerId, roomId, userId, null]
          );
          await db.query(
            `DELETE FROM draft_order 
            WHERE draft_order_id = (SELECT MIN(draft_order_id) FROM draft_order WHERE draft_id = $1)`,
            [roomId]
          );

          // Reset the countdown timer to its default value
          const draftSettings = await fetchDraftSettings(roomId);
          const defaultPickTimeInSeconds = draftSettings.pick_time_seconds;
          remainingTimes[roomId] = defaultPickTimeInSeconds;

          // Start the countdown timer with the updated remaining time
          startCountdown(roomId);
        } catch (error) {
          console.log(error);
        }

        // Fetch and emit available players to the draft room after a pick
        const availablePlayers = await fetchAvailablePlayers(roomId);
        io.in(roomId).emit('receive-available-players', availablePlayers);
        const currentDraftOrder = await fetchCurrentDraftOrder(roomId);
        io.in(roomId).emit('send-draft-order', currentDraftOrder);
      }
    );
  });
}