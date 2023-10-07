import { Server, Socket } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import { DraftTurn, fetchRoster, fetchAvailablePlayers, 
  fetchCurrentDraftOrder, fetchDraftSettings, fetchAllPicks} from './utils/draft';
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
  const autodraftStates = new Map<string, boolean>(); // Autodraft states for each room

  async function startCountdown(roomId: string) {
    if (draftRoomTimers[roomId] !== undefined) {
      clearInterval(draftRoomTimers[roomId]);
    }

    const draftSettings = await fetchDraftSettings(roomId); // Default pick time duration in seconds
    const defaultPickTimeInSeconds = draftSettings.pick_time_seconds;
    let remainingTime = remainingTimes[roomId] ?? defaultPickTimeInSeconds;
    const currentDraftOrder = await fetchCurrentDraftOrder(roomId);
    const userDraftTurn = currentDraftOrder[0];
    let isUserOnAutodraft = false;

    if (currentDraftOrder.length < 1) {
      return;
    }

    try {
      if (userDraftTurn.user_id) {
        const userDraftData = await db.query(
          `SELECT * FROM draft_user WHERE user_id=$1 AND draft_id=$2`,
          [userDraftTurn.user_id, roomId]
        );
        isUserOnAutodraft = userDraftData.rows[0].is_autodraft_on;
        io.in(roomId).emit('update-draft-turn', userDraftTurn.user_id);
      }
    } catch (error) {}

    if (currentDraftOrder.length > 0) {
      // Emit the current remaining time to all users in the room
      io.in(roomId).emit('update-clock', remainingTime);

      draftRoomTimers[roomId] = setInterval(async () => {
        if (currentDraftOrder[0].bot_number) {
          try {
            await autoDraft(null, currentDraftOrder[0].bot_number, roomId);
            const newDraftOrder = await fetchCurrentDraftOrder(roomId);
            const currentAvailablePlayers = await fetchAvailablePlayers(roomId);
            const allPicks = await fetchAllPicks(roomId);
            io.in(roomId).emit('send-draft-order', newDraftOrder);
            io.in(roomId).emit('receive-available-players', currentAvailablePlayers);
            io.in(roomId).emit('update-total-draftpicks', allPicks);
            clearInterval(draftRoomTimers[roomId]);
            remainingTimes[roomId] = defaultPickTimeInSeconds;
            io.in(roomId).emit('update-draft-turn', newDraftOrder[0].user_id);
            startCountdown(roomId);
          } catch (error) {}
        }

        if (remainingTimes[roomId] <= 0 || autodraftStates.get(roomId) || isUserOnAutodraft) {
          if (draftRoomTimers[roomId] !== undefined) {
            autodraftStates.set(roomId, false);
            clearInterval(draftRoomTimers[roomId]);
            remainingTimes[roomId] = defaultPickTimeInSeconds; // Reset the timer to default time
            await autoDraft(userDraftTurn.user_id, null, roomId);
            const roster = await fetchRoster(roomId, userDraftTurn.user_id);
            io.in(roomId).emit('autodraft-enabled', userDraftTurn.user_id, roomId);
            io.in(roomId).emit('update-roster', { players: roster, userId: userDraftTurn.user_id });
            const currentAvailablePlayers = await fetchAvailablePlayers(roomId);
            io.in(roomId).emit('receive-available-players', currentAvailablePlayers);
            const newDraftOrder = await fetchCurrentDraftOrder(roomId);
            io.in(roomId).emit('send-draft-order', newDraftOrder);
            const allPicks = await fetchAllPicks(roomId);
            io.in(roomId).emit('update-total-draftpicks', allPicks);
            try {
              io.in(roomId).emit('update-draft-turn', newDraftOrder[0].user_id);
            } catch (error) {}
            startCountdown(roomId); // Restart the countdown timer with default time
          }
        } else {
          remainingTimes[roomId] -= 1; // Decrement the remaining time by 1 second
          // Emit the updated remaining time to all users in the room
          io.in(roomId).emit('update-clock', remainingTimes[roomId]);
        }
      }, 1000); // Update every second
    } else {
      console.log("Draft is over");
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
      const allPicks = await fetchAllPicks(roomId);
      io.in(roomId).emit('update-total-draftpicks', allPicks);

      if (draftSettings.is_started) {
        startCountdown(roomId);
      } else {
        socket.on('start-draft', () => {
          startCountdown(roomId);
        });
      }

      // Fetch and emit available players to the draft room
      const availablePlayers = await fetchAvailablePlayers(roomId);
      io.in(roomId).emit('receive-available-players', availablePlayers);

      // Emit the current remaining time to the newly joined user
      socket.emit('update-clock', remainingTimes[roomId]);

      socket.on('update-autodraft', async (isAuto: boolean, userId: number, draftId: number) => {
        if (draftId == Number(roomId)) {
          autodraftStates.set(roomId, isAuto); // Update autodraft state for the current room only
          await db.query(
            `UPDATE draft_user
              SET is_autodraft_on=$1
              WHERE user_id=$2 AND draft_id=$3`,
            [isAuto, userId, Number(roomId)]
          );
        }
      });
    });

    socket.on(
      'pick-player',
      async (playerId: string, userId: string, roomId: string) => {
        try {
          await db.query(
            `INSERT INTO draft_pick (player_id, draft_id, picked_by_user_id, picked_by_bot_number, pick_number)
          VALUES ($1, $2, $3, $4, COALESCE((SELECT MAX(pick_number) + 1 FROM draft_pick WHERE draft_id = $2), 1))`,
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
        } catch (error) {
          console.log(error);
        }

        // Fetch and emit available players to the draft room after a pick
        const availablePlayers = await fetchAvailablePlayers(roomId);
        io.in(roomId).emit('receive-available-players', availablePlayers);
        const currentDraftOrder = await fetchCurrentDraftOrder(roomId);
        io.in(roomId).emit('send-draft-order', currentDraftOrder);
        io.in(roomId).emit('update-draft-turn', currentDraftOrder[0].user_id);
        const allPicks = await fetchAllPicks(roomId);
        io.in(roomId).emit('update-total-draftpicks', allPicks);
        startCountdown(roomId);
      }
    );
  });
}
