import { BasketballRoster } from "./roster";
import { fetchDraftSettings } from "./dataFetchers";
import { BasketballPlayer } from "./types";
const db = require("../../db");

export async function dequeuePick(draftId: string, userId: number, ) {
    const userPicks = await db.query(
        `SELECT *
        FROM draft_pick AS D
        INNER JOIN nba_player AS P
        ON D.player_id = P.player_id
        WHERE D.picked_by_user_id = $1 AND D.draft_id = $2
        ORDER BY D.pick_number DESC`,
        [Number(userId), Number(draftId)]
    );
    const rosterRules = await fetchDraftSettings(draftId);

    const roster = new BasketballRoster(rosterRules);
    roster.addPlayers(userPicks.rows)

    try {
        const queuedPlayers = await db.query(
            `SELECT * 
            FROM pick_queue AS Q
            INNER JOIN nba_player AS P
            ON Q.player_id = P.player_id
            WHERE Q.draft_id = $1 AND Q.user_id = $2
            ORDER BY rank;`,
            [draftId, userId]
        );

        for (let i = 0; i < queuedPlayers.rows.length; i++) {
            // Deep copy of the roster
            const tempRoster = new BasketballRoster(rosterRules);
			tempRoster.setRosterList(JSON.parse(JSON.stringify(roster.getRosterList())));

            const player = queuedPlayers.rows[i];

            if (tempRoster.addPlayer(player)) {

                await db.query(
                    `INSERT INTO draft_pick (player_id, draft_id, picked_by_user_id, picked_by_bot_number, pick_number)
                    VALUES ($1, $2, $3, $4, COALESCE((SELECT MAX(pick_number) + 1 FROM draft_pick WHERE draft_id = $2), 1))`,
                    [player.player_id, draftId, userId, null]
                );
                await db.query(
                    `DELETE FROM pick_queue
                    WHERE player_id = $1 AND draft_id = $2;`,
                    [player.player_id, draftId]
                );
                await db.query(
                    `DELETE FROM draft_order 
                    WHERE draft_order_id = (SELECT MIN(draft_order_id) FROM draft_order WHERE draft_id = $1)`,
                    [draftId]
                );
                
                // Removes all players in the queue if, after dequeuing the latest player, there are players
                // that cannot be added to a user's roster.
				if (queuedPlayers.rows.length > 1 && !tempRoster.addPlayer(queuedPlayers.rows[i + 1])) {
					for (let j = 0; j < queuedPlayers.rows.length; j++) {
						const player = queuedPlayers.rows[j];
                        
                        // Deep copy of the user's current roster
                        const newTempRoster = new BasketballRoster(rosterRules);
						newTempRoster.setRosterList(JSON.parse(JSON.stringify(tempRoster.getRosterList())));

                        // Removes all players from the queue that cannot be added to the roster.
						if (!newTempRoster.addPlayer(player)) {
							await db.query(
								`DELETE FROM pick_queue
								WHERE player_id = $1 AND draft_id = $2;`,
								[player.player_id, draftId]
							);
						}
					}
				}
				
                return true; // Player was successfully dequeued
            } else {
                // If the dequeued player cannot be added to the roster, remove them from the pick queue.
                await db.query(
                    `DELETE FROM pick_queue
                    WHERE player_id = $1 AND draft_id = $2;`,
                    [player.player_id, draftId]
                );
            }
        }

        return false; // If there are no players to be dequeued, return false
    } catch (error) {
        return false;
    }
}