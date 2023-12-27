import { DatabaseConnection } from "../../database/DatabaseConnection";
import { User } from "../users/contracts/dataTypes/User";
import { IDraftsRepository } from "./contracts/IDraftsRepository";
import { Draft } from "./contracts/dataTypes/Draft";
import { DraftInvite } from "./contracts/dataTypes/DraftInvite";

export class DraftsRepository implements IDraftsRepository {

    private readonly _db: DatabaseConnection;

    constructor() {
        this._db = new DatabaseConnection();
    }

    async deleteDraftById(draftId: number) {
        await this._db.query(
            `DELETE FROM drafts WHERE draft_id = $1`, [draftId]
        );
    }

    async getDraftById(draft_id: number): Promise<Draft | null> {
        const draft: Draft[] = await this._db.query(
            `SELECT * FROM drafts WHERE draft_id = $1 LIMIT 1`, [draft_id]
        );
        return draft.length === 1 ? draft[0] : null;
    }

    async getDraftsByUserId(user_id: number): Promise<Draft[]> {
        const drafts: Draft[] = await this._db.query(
            `SELECT * FROM draft_users AS DU
            INNER JOIN drafts AS D
            ON DU.draft_id = D.draft_id
            WHERE DU.user_id = $1`, [user_id]);
        return drafts;
    }

    async insertDraftUser(draft_id: number, user_id: number): Promise<void> {
        await this._db.query(
            `INSERT INTO draft_users (user_id, draft_id)
            SELECT $1, $2 WHERE NOT EXISTS (
                SELECT 1 FROM draft_users WHERE user_id = $1 AND draft_id = $2
            )`, [user_id, draft_id]
        );
    }

    async updateUserDraftPosition(user_id: number, draft_id: number, team_number: number): Promise<void> {
        await this._db.query(
            `UPDATE draft_orders
            SET user_id = $1 
            WHERE draft_id = $2 AND team_number = $3`, [
                user_id, draft_id, team_number
        ]);
    }

    async getInvitedDraftUsers(user_ids: number[], draft_id: number): Promise<DraftInvite[]> {
        let recipients: DraftInvite[] = (await this._db.query(`
            SELECT user_id, email, username FROM users
            WHERE user_id = ANY($1)
            `, [user_ids])).map((row: any) => {
                return {
                    email: row.email,
                    draft_id: draft_id
                };
            });
        return recipients;
    }

    async insertDraftOrderPosition(team_number: number, draft_id: number, pick_number: number): Promise<void> {
        await this._db.query(
            `INSERT INTO draft_orders (team_number, draft_id, pick_number)
            VALUES ($1, $2, $3)`, [
                team_number, draft_id, pick_number
        ]);
    }

    async insertDraft(draft: Draft): Promise<number> {
        const draft_id: number = (await this._db.query(
            `INSERT INTO drafts (draft_type, scoring_type, pick_time_seconds, 
                team_count, pointguard_slots, shootingguard_slots, guard_slots, 
                smallforward_slots, powerforward_slots, forward_slots,
                center_slots, utility_slots, bench_slots, scheduled_by_user_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING draft_id`, [
                draft.draft_type, draft.scoring_type, draft.pick_time_seconds, 
                draft.team_count, draft.pointguard_slots, draft.shootingguard_slots, 
                draft.guard_slots, draft.smallforward_slots, draft.powerforward_slots, 
                draft.forward_slots, draft.center_slots, draft.utility_slots, 
                draft.bench_slots, draft.scheduled_by_user_id
            ]
        ))[0].draft_id
        return draft_id;
    }

    async updateDraft(draft: Draft, draft_id: number): Promise<number> {
        const updated_draft_id: number = (await this._db.query(
            `UPDATE drafts
            SET draft_type = $1, scoring_type = $2, pick_time_seconds = $3, 
                team_count = $4, pointguard_slots = $5, shootingguard_slots = $6, 
                guard_slots = $7, smallforward_slots = $8, powerforward_slots = $9, 
                forward_slots = $10, center_slots = $11, utility_slots = $12, 
                bench_slots = $13, scheduled_by_user_id = $14
            WHERE draft_id = $15
            RETURNING draft_id`, [
                draft.draft_type, draft.scoring_type, draft.pick_time_seconds, 
                draft.team_count, draft.pointguard_slots, draft.shootingguard_slots, 
                draft.guard_slots, draft.smallforward_slots, draft.powerforward_slots, 
                draft.forward_slots, draft.center_slots, draft.utility_slots, 
                draft.bench_slots, draft.scheduled_by_user_id, draft_id
            ]
        ))[0].draft_id;
        return updated_draft_id
    }

    async deleteDraftOrder(draftId: number): Promise<void> {
        await this._db.query(
            `DELETE FROM draft_orders WHERE draft_id = $1`, [draftId]
        );
    }
}