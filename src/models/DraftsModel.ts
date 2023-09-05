import { Request, Response } from 'express';
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
}
  
module.exports = new DraftsModel();