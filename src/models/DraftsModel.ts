import { Request, Response } from 'express';
import { genLinearDraftOrder } from '../utils/genDraftOrder';
import { genSnakeDraftOrder } from '../utils/genDraftOrder';
import { Recipient, sendEmailInvites } from '../utils/sendInviteEmail';
import { deleteDraft } from './draftsModel/deleteDraft';
const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';
dotenv.config();
const db = require("../db"); // Connection for querying the Postgres database

class DraftsModel {

    public async deleteDraft(req: Request) {
        const {draftId} = req.query;
        deleteDraft(Number(draftId));
    }

    // Retrieves summary data of all the drafts a user has created or joined
    public async getDrafts(req: Request) {
        const userId = req.query.userId;

        const drafts = await db.query(`
        SELECT U.user_id, D.draft_id, draft_type, U.username, team_count,
        scheduled_by_user_id, draft_type, scoring_type, pick_time_seconds,
        is_started
        FROM draft_user AS DU
        INNER JOIN draft AS D ON DU.draft_id = D.draft_id
        INNER JOIN user_account AS U ON D.scheduled_by_user_id = U.user_id
        WHERE DU.user_id = $1 AND DU.is_invite_accepted = TRUE;`, [
            userId
        ]);

        return drafts.rows;
    }

    public async startDraft(req: Request) {
        await db.query(`
            UPDATE draft SET is_started=true WHERE draft_id=$1`, [
                req.params.id
            ]
        );
        return 200;
    }

    public async toggleAutodraft(req: Request) {
        await db.query(
			`UPDATE draft_user
			SET is_autodraft_on=$1
			WHERE user_id=$2 AND draft_id=$3`, [
				req.body.isAutodraftOn, Number(req.body.userId), Number(req.body.userId)
			]
		);
        return 200
    }

    public async getAutodraftStatus(req: Request) {
        const autodraftData = await db.query(
			`SELECT * FROM draft_user
			WHERE user_id=$1 AND draft_id=$2`, [
				Number(req.query.userId), Number(req.query.draftId)
			]
		);
        return autodraftData.rows[0]
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

                const draftUsers = await db.query(`
                    SELECT *
                    FROM draft_user
                    WHERE draft_id = $1`, [
                        Number(draftId)
                ]);

                draft.rows[0]['draft_members'] = draftUsers.rows;

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

    public async updateMember(req: Request) {
        const isInviteAccepted = req.body.isInviteAccepted;
        const userId = req.body.userId;
        const draftId = req.body.draftId;

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

        return 200;
    }

    public async emailUpdateMember(req: Request) {
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

    public async createDraft(req: Request) {
        let {draftType, scoringType, pickTimeSeconds,
            teamCount, pointguardSlots, shootingguardSlots,
            guardSlots, smallforwardSlots, powerforwardSlots, forwardSlots,
            centerSlots, utilitySlots, benchSlots,
            scheduledByUserId, scheduledByUsername, draftPosition, draftUserIds} = req.body;

        const recipientIds = [...draftUserIds];

        if (draftPosition-1<draftUserIds.length) {
            draftUserIds.splice(draftPosition-1, 0, scheduledByUserId);
        }
            
        // Sum of all position slots gives the total team size each team has
        const teamSize = pointguardSlots+shootingguardSlots
            +guardSlots+smallforwardSlots+powerforwardSlots
            +forwardSlots+centerSlots+utilitySlots+benchSlots;
    

        // Creates and returns the draft
        const createdDraft = await db.query(
            `INSERT INTO draft (draft_type, scoring_type, pick_time_seconds, 
                team_count, pointguard_slots, shootingguard_slots, guard_slots, 
                smallforward_slots, powerforward_slots, forward_slots,
                center_slots, utility_slots, bench_slots, scheduled_by_user_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING draft_id`, [
                draftType, scoringType, pickTimeSeconds, teamCount, pointguardSlots,
                shootingguardSlots, guardSlots, smallforwardSlots, powerforwardSlots,
                forwardSlots, centerSlots, utilitySlots, benchSlots, scheduledByUserId
            ]
        );

        // Order of which pick each member has
        let draftOrder: number[] = []

        if (draftType == "snake") {
            // Generates the draft order with a snake algorithm
            draftOrder = genSnakeDraftOrder(teamCount, teamSize);
        }
        else if (draftType == "linear") {
            // Generates the draft order with a linear algorithm
            draftOrder = genLinearDraftOrder(teamCount, teamSize);
        }

        // Inserts the draft order into the database
        let pickNumber = 1;
        for (const order of draftOrder) {
            if (order-1 < draftUserIds.length) {
                await db.query(
                `INSERT INTO draft_order (user_id, draft_id, pick_number)
                VALUES ($1, $2, $3)`, [
                    draftUserIds[order-1], createdDraft.rows[0].draft_id, pickNumber
                ]);
            }
            else if (order==draftPosition) {
                await db.query(
                    `INSERT INTO draft_order (user_id, draft_id, pick_number)
                    VALUES ($1, $2, $3)`, [
                    scheduledByUserId, createdDraft.rows[0].draft_id, pickNumber
                ]);
            }
            else {
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
            `INSERT INTO draft_user (user_id, draft_id, is_invite_accepted)
            VALUES ($1, $2, $3)`, [
                scheduledByUserId, createdDraft.rows[0].draft_id, true
            ]
        );

        draftUserIds.forEach(async (userId: number) => {
            if (userId != scheduledByUserId) {
                await db.query(
                    `INSERT INTO draft_user (user_id, draft_id)
                    VALUES ($1, $2)`, [
                        userId, createdDraft.rows[0].draft_id
                    ]
                );
            }
        });

        let recipients = await db.query(`
            SELECT user_id AS "userId", username, email FROM user_account
            WHERE user_id = ANY($1)
            `, [recipientIds]);

        recipients = recipients.rows.map((recipient: any) => ({
            ...recipient, // Copy the existing properties of the object
            draftId: createdDraft.rows[0].draft_id, // Add the new key-value pair
        }));

        await sendEmailInvites(recipients, scheduledByUsername);

    // Returns the draft id the draft that was created.
    return createdDraft.rows[0].draft_id;
    }
}
  
module.exports = new DraftsModel();