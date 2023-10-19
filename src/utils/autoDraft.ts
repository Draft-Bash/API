import { fetchDraftSettings, fetchAvailablePlayers } from "./draft";
import { addPlayer } from "./draft";
import { Player, DraftRoster } from "./draft";
const db = require('../db');

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
                WHERE D.picked_by_user_id = $1 AND D.draft_id = $2`, [
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
                WHERE D.picked_by_bot_number = $1 AND D.draft_id = $2`, [
                    Number(botNumber), Number(draftId)
                ]
            );
            picks = botPicks.rows;
        }

        const rosterSpots: DraftRoster = {
            pointguard: Array.from({ length: draftRules.pointguard_slots }, () => null),
            shootingguard: Array.from({ length: draftRules.shootingguard_slots }, () => null),
            guard: Array.from({ length: draftRules.guard_slots }, () => null),
            smallforward: Array.from({ length: draftRules.smallforward_slots }, () => null),
            powerforward: Array.from({ length: draftRules.powerforward_slots }, () => null),
            forward: Array.from({ length: draftRules.forward_slots }, () => null),
            center: Array.from({ length: draftRules.center_slots }, () => null),
            utility: Array.from({ length: draftRules.utility_slots }, () => null),
            bench: Array.from({ length: draftRules.bench_slots }, () => null)
        };

        picks.forEach((player: Player) => {
            addPlayer(player, rosterSpots);
        });

        const undraftedPlayers = await fetchAvailablePlayers(draftId);
        let n = 3;
        let isPlayerDrafted = false;
        while (!isPlayerDrafted) {
            for (let i=0; i<n; i++) {
                const randomIndex = Math.floor(Math.random() * n);
                if (addPlayer(undraftedPlayers[randomIndex], rosterSpots)) {
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