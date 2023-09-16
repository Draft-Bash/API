import { Request, Response } from 'express';
import { genLinearDraftOrder } from '../utils/genDraftOrder';
import { genSnakeDraftOrder } from '../utils/genDraftOrder';
import dotenv from 'dotenv';
dotenv.config();
const db = require("../db"); // Connection for querying the Postgres database

class DraftsModel {

    // Retrieves summary data of all the drafts a user has created or joined
    public async getDrafts(req: Request) {
        const userId = req.query.user_id;

        const drafts = await db.query(`
        SELECT U.user_id, D.draft_id, draft_type, username, team_count,
        scheduled_by_user_id, draft_type, scoring_type, pick_time_seconds
        FROM draft_user AS DU
        INNER JOIN draft AS D ON DU.draft_id = D.draft_id
        INNER JOIN user_account AS U ON DU.user_id = U.user_id
        WHERE DU.user_id = $1;`, [
            userId
        ]);

        return drafts.rows;
    }

    /* Fetches basic draft info for a draft. 
    This includes settings like number of teams, team size, etc
    */
    public async getDraft(req: Request) {
        try {
            const draftId = req.params.id;

            if (draftId) {
                const draft = await db.query(`
                SELECT * 
                FROM draft 
                WHERE draft_id = $1`, [
                    Number(draftId)
                ]);

                return draft.rows[0];
            }
        } catch (error) {}
    }

    // Gets all undrafted players that are currently in a draft
    public async getPlayers(req: Request) {
        const {draftId} = req.query;

        const players = await db.query(
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
            ORDER BY R.rank_number;`, [
              Number(draftId)
            ]
        );

        return players.rows;
    }

    // Adds a picked player from a draft to the draft_pick table
    public async pickPlayer(req: Request) {
        // A player can be picked by a user or bot.
        const {userId, playerId, draftId, botNumber} = req.body;
        
        await db.query(
            `INSERT INTO draft_pick (player_id, draft_id, picked_by_user_id, picked_by_bot_number)
            VALUES ($1, $2, $3, $4)`, [
                playerId, draftId, userId, botNumber
            ]
        );
    }

    // Gets all picks made by a user in a draft
    public async getPicks(req: Request) {
        const {userId, draftId} = req.query;
        const picks = await db.query(
            `SELECT *
            FROM draft_pick AS D
            INNER JOIN nba_player AS P
            ON D.player_id = P.player_id
            WHERE D.picked_by_user_id = $1 AND D.draft_id = $2`, [
                Number(userId), Number(draftId)
            ]
        );
        return picks.rows;
    }

    // Gets all members in the draft
    public async getMembers(req: Request) {
        const draftId = req.query.draftId;

        // Gets all users the draft
        const draftUserData = await db.query(
            `SELECT U.user_id, draft_id, username
            FROM draft_user AS DU
            INNER JOIN user_account AS U
            ON DU.user_id = U.user_id
            WHERE DU.draft_id = $1`, [
                Number(draftId)
            ]
        );

        // If the draft has members that are not a user, then they are a 'bot'
        const draftBotsData = await db.query(
            `SELECT DISTINCT bot_number
            FROM draft_order
            WHERE draft_id = $1 AND bot_number IS NOT NULL
            ORDER BY bot_number`, [
                Number(draftId)
            ]
        );

        const draftUsers = draftUserData.rows;
        const draftBots = draftBotsData.rows.map((obj: any) => obj.bot_number);
        const draftMembers = {"draftUsers": draftUsers, "draftBots": draftBots}
        return draftMembers;
    }

    // Creates a draft with various settings configured.
    public async createDraft(req: Request) {
        const {draft_type, scoring_type, pick_time_seconds,
            team_count, pointguard_slots, shootingguard_slots,
            guard_slots, smallforward_slots, powerforward_slots, forward_slots,
            center_slots, utility_slots, bench_slots,
            scheduled_by_user_id, draft_position} = req.body;
            
        // Sum of all position slots gives the total team size each team has
        const teamSize = pointguard_slots+shootingguard_slots
            +guard_slots+smallforward_slots+powerforward_slots
            +forward_slots+center_slots+utility_slots+bench_slots;
    

            // Creates and returns the draft
            const createdDraft = await db.query(
                `INSERT INTO draft (draft_type, scoring_type, pick_time_seconds, 
                    team_count, pointguard_slots, shootingguard_slots, guard_slots, 
                    smallforward_slots, powerforward_slots, forward_slots,
                    center_slots, utility_slots, bench_slots, scheduled_by_user_id) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING draft_id`, [
                    draft_type, scoring_type, pick_time_seconds, team_count, pointguard_slots,
                    shootingguard_slots, guard_slots, smallforward_slots, powerforward_slots,
                    forward_slots, center_slots, utility_slots, bench_slots, scheduled_by_user_id
                ]
            );
    
            // Order of which pick each member has
            let draftOrder: number[] = []

            if (draft_type == "snake") {
                // Generates the draft order with a snake algorithm
                draftOrder = genSnakeDraftOrder(team_count, teamSize);
            }
            else if (draft_type == "linear") {
                // Generates the draft order with a linear algorithm
                draftOrder = genLinearDraftOrder(team_count, teamSize);
            }
    
            // Inserts the draft order into the database
            let pickNumber = 1;
            for (const order of draftOrder) {
                if (order == draft_position) {
                    await db.query(
                    `INSERT INTO draft_order (user_id, draft_id, pick_number)
                    VALUES ($1, $2, $3)`, [
                    scheduled_by_user_id, createdDraft.rows[0].draft_id, pickNumber
                    ]);
                } else {
                    await db.query(
                    `INSERT INTO draft_order (bot_number, draft_id, pick_number)
                    VALUES ($1, $2, $3)`, [
                    order, createdDraft.rows[0].draft_id, pickNumber
                    ]);
                }
                pickNumber += 1;
            }
    
            /* Inserts the draft's users' ids into the draft_user table so 
            that we know which drafts a user belongs to */
            await db.query(
                `INSERT INTO draft_user (user_id, draft_id)
                VALUES ($1, $2)`, [
                    scheduled_by_user_id, createdDraft.rows[0].draft_id
                ]
            );

        // Returns the draft id the draft that was created.
        return createdDraft.rows[0].draft_id;
    }
}
  
module.exports = new DraftsModel();