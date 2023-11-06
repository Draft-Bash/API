import { Request, Response } from 'express';
const db = require("../db");
const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';
dotenv.config();


class DraftInvitesModel {

    // Gets all invites a user currenly has
    public async getInvites(req: Request) {
        const invites = await db.query(`
            SELECT DU.user_id, DU.draft_id, DU.is_invite_read, U.username, D.team_count, D.scoring_type
            FROM draft_user AS DU
            INNER JOIN draft AS D
            ON DU.draft_id = D.draft_id
            INNER JOIN user_account AS U
            ON D.scheduled_by_user_id = U.user_id
            WHERE DU.user_id = $1 AND DU.is_invite_accepted = FALSE`, [
            req.query.userId
        ]);

        return invites.rows;
    }

    public async updateInviteThruEmail(req: Request) {
        const jwtUser = req.query.jwtUser;
        const recipient = jwt.verify(jwtUser, process.env.JWT_SECRET);
        const isInviteAccepted = (req.query.isInviteAccepted=='true') ? true : false;
        const userId = Number(recipient.userId);
        const draftId = Number(recipient.draftId);

        if (isInviteAccepted) {
            await db.query(
                `UPDATE draft_user SET is_invite_accepted = $1
                WHERE user_id = $2 AND draft_id = $3`, [
                    isInviteAccepted, userId, draftId
                ]
            );
        } else {
            await db.query(
                `UPDATE draft_order AS DO1
                SET bot_number = (
                    SELECT DO2.pick_number
                    FROM draft_order AS DO2
                    WHERE DO2.user_id = $1 AND DO2.draft_id = $2
                    ORDER BY pick_number ASC
                    LIMIT 1
                ),
                user_id = NULL
                FROM draft as D
                WHERE DO1.user_id = $1 AND DO1.draft_id = $2 AND D.is_started = FALSE;`, [
                    userId, draftId
                ]
            );
            await db.query(
                `DELETE FROM draft_user WHERE user_id = $1 AND draft_id = $2`, [
                    userId, draftId
                ]
            );
        }

        return 200;
    }


    public async deleteInvite(req: Request) {
        const userId = req.body.userId;
        const draftId = req.body.draftId;
        
        // If a user declines the invite, they will be replaced by a bot in the draft.
        await db.query(
            `UPDATE draft_order AS DO1
            SET bot_number = (
                SELECT DO2.pick_number
                FROM draft_order AS DO2
                WHERE DO2.user_id = $1 AND DO2.draft_id = $2
                ORDER BY pick_number ASC
                LIMIT 1
            ),
            user_id = NULL
            FROM draft as D
            WHERE DO1.user_id = $1 AND DO1.draft_id = $2 AND D.draft_id = $2 AND D.is_started = FALSE;`, [
                userId, draftId
            ]
        );
        await db.query(
            `DELETE FROM draft_user WHERE user_id = $1 AND draft_id = $2`, [
                userId, draftId
            ]
        );
    }

    public async acceptInvite(req: Request) {
        const userId = req.body.userId;
        const draftId = req.body.draftId;

        await db.query(
            `UPDATE draft_user SET is_invite_accepted = $1
            WHERE user_id = $2 AND draft_id = $3`, [
                true, userId, draftId
            ]
        );

        return 200
    }

    // If a user opens the invite icon, all unread invites should now be considered read.
    public async readInvites(req: Request) {
        await db.query(`
        UPDATE draft_user SET is_invite_read = TRUE WHERE user_id = $1`, [
            req.query.userId
        ]);

        return 200;
    }

    public async IsUserReal(req: Request) {

        const userData = await db.query(`
            SELECT username, user_id FROM user_account WHERE username=$1`, [
                req.body.username
            ]
        );

        // Checks if the invited user matches any currently existing user
        if (userData.rows.length>0) {
            return {users: userData.rows, isMatch: true}
        }
        else {
            // If no user is found, return a list of similar-sounding users the user can invite.
            const matches = await db.query(`
                SELECT username, user_id FROM user_account WHERE username LIKE $1 LIMIT 5`, [
                    `${req.body.username}%`
                ]
            );
            return {users: matches.rows, isMatch: false}
        }
    }
}
  
module.exports = new DraftInvitesModel();