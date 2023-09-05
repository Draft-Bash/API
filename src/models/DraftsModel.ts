import { Request, Response } from 'express';
import { genLinearDraftOrder } from '../utils/genDraftOrder';
import { genSnakeDraftOrder } from '../utils/genDraftOrder';

const db = require("../db");

class DraftsModel {

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

    public async createDraft(req: Request) {
        
        const {draft_type, scoring_type, pick_time_seconds,
            team_count, pointguard_slots, shootingguard_slots,
            guard_slots, smallforward_slots, powerforward_slots, forward_slots,
            center_slots, utility_slots, bench_slots,
            scheduled_by_user_id, draft_position} = req.body;
            
            const teamSize = pointguard_slots+shootingguard_slots
                +guard_slots+smallforward_slots+powerforward_slots
                +forward_slots+center_slots+utility_slots+bench_slots;
    
    
    
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
    
    
            let draftOrder: number[] = []
            if (draft_type == "snake") {
                draftOrder = genSnakeDraftOrder(team_count, teamSize);
            }
            else if (draft_type == "linear") {
                draftOrder = genLinearDraftOrder(team_count, teamSize);
            }
    
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
    
            await db.query(
                `INSERT INTO draft_user (user_id, draft_id)
                VALUES ($1, $2)`, [
                    scheduled_by_user_id, createdDraft.rows[0].draft_id
                ]
            );
    
            return createdDraft.rows[0].draft_id;
    }
}
  
module.exports = new DraftsModel();