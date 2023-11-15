import { fetchDraftSettings, fetchAvailablePlayers } from "./dataFetchers";
import { addPlayer } from "../draft";
import { Player, DraftRoster } from "../draft";
import { BasketballRoster } from "./roster";
const db = require('../../db');

export async function autoDraft(userId: number | null, botNumber: number | null, draftId: string) {
    try {
        const draftRules = await fetchDraftSettings(draftId);
        let picks;
        if (userId != null) {
            const userPicks = await db.query(
                `SELECT *
                FROM draft_pick AS D
                INNER JOIN nba_player AS P
                ON D.player_id = P.player_id
                WHERE D.picked_by_user_id = $1 AND D.draft_id = $2
                ORDER BY D.pick_number ASC`, [
                    Number(userId), Number(draftId)
                ]
            );
            await db.query(
                `UPDATE draft_user
                SET is_autodraft_on=true
                WHERE user_id=$1 AND draft_id=$2`, [
                    Number(userId), Number(draftId)
                ]
            );
            picks = userPicks.rows
        }
        else if (botNumber) {
            const botPicks = await db.query(
                `SELECT *
                FROM draft_pick AS D
                INNER JOIN nba_player AS P
                ON D.player_id = P.player_id
                WHERE D.picked_by_bot_number = $1 AND D.draft_id = $2
                ORDER BY D.pick_number ASC`, [
                    Number(botNumber), Number(draftId)
                ]
            );
            picks = botPicks.rows;
        }

        const rosterSpots = new BasketballRoster(draftRules);
        rosterSpots.addPlayers(picks)

        const undraftedPlayers = await fetchAvailablePlayers(draftId);
        let n = 3;
        let isPlayerDrafted = false;
        while (!isPlayerDrafted) {
            for (let i=0; i<n; i++) {
                const randomIndex = Math.floor(Math.random() * n);
                if (rosterSpots.addPlayer(undraftedPlayers[randomIndex])) {
                    isPlayerDrafted = true;
                    await db.query(
                        `INSERT INTO draft_pick (player_id, draft_id, picked_by_user_id, picked_by_bot_number, pick_number)
                        VALUES ($1, $2, $3, $4, COALESCE((SELECT MAX(pick_number) + 1 FROM draft_pick WHERE draft_id = $2), 1))`,
                        [undraftedPlayers[randomIndex].player_id, draftId, userId, botNumber]
                    );
                    await db.query(
                        `DELETE FROM draft_order 
                        WHERE draft_order_id = (SELECT MIN(draft_order_id) FROM draft_order WHERE draft_id = $1)`,
                        [draftId]
                    );
                    await db.query(
                        `DELETE FROM pick_queue WHERE draft_id = $1 AND player_id = $2`,
                        [draftId, undraftedPlayers[randomIndex].player_id]
                        );
                    break;
                }
            }
            n+=1;
            if (n>500) {
                break;
            }
        }
    } catch (error) {}
}