const db = require("../../db");

export async function fetchDraftQueue(draftId: string) {
	const picks = await db.query(
		`SELECT * FROM pick_queue AS Q
		INNER JOIN nba_player AS P
		ON Q.player_id = P.player_id
		WHERE draft_id = $1
		ORDER BY RANK`,
		[draftId]
	);
	return picks.rows;
}

export async function fetchAllPicks(draftId: string) {
	const picks = await db.query(
		`SELECT U.username, D.player_id, D.draft_id, D.picked_by_bot_number, 
		P.first_name, P.last_name, D.pick_number, T.team_abbreviation,
		P.is_pointguard, P.is_shootingguard, P.is_smallforward, P.is_powerforward,
		P.is_center
		FROM draft_pick AS D
		LEFT JOIN user_account AS U
		ON D.picked_by_user_id = U.user_id
		INNER JOIN nba_player AS P
		ON D.player_id = P.player_id
		LEFT JOIN nba_team AS T
		ON P.team_id = T.team_id
		WHERE D.draft_id = $1
		ORDER BY D.pick_number DESC;
		`,
		[draftId]
	);
	return picks.rows;
}

export async function fetchCurrentDraftOrder(roomId: string) {
	const draftOrderData = await db.query(
		`SELECT username, draft_order_id, U.user_id, 
        draft_id, bot_number, pick_number
        FROM draft_order AS O
        LEFT JOIN user_account AS U ON O.user_id = U.user_id
        WHERE draft_id = $1
        ORDER BY draft_order_id
        LIMIT 40`,
		[roomId]
	);
	return draftOrderData.rows;
}

export async function fetchDraftSettings(roomId: string) {
	const draftSettings = await db.query(
		`SELECT * FROM draft WHERE draft_id = $1`,
		[roomId]
	);
	return draftSettings.rows[0];
}

export async function fetchAvailablePlayers(roomId: string) {
	let availablePlayers = await db.query(
		`SELECT * 
    FROM points_draft_ranking AS R
    INNER JOIN nba_player as P
    ON R.player_id = P.player_id
    INNER JOIN nba_player_season_totals AS T
    ON P.player_id = T.player_id
	INNER JOIN nba_team AS NT
	ON P.team_id = NT.team_id
    WHERE R.player_id NOT IN (
      SELECT player_id
      FROM draft_pick
      WHERE draft_id = $1
    )
    ORDER BY R.rank_number;`,
		[roomId]
	);
	return availablePlayers.rows;
}

export async function fetchRoster(roomId: string, userId: string) {
	let roster = await db.query(
		`SELECT *
    FROM draft_pick AS D
    INNER JOIN nba_player AS P
    ON D.player_id = P.player_id
    WHERE D.picked_by_user_id = $1 AND D.draft_id = $2
	ORDER BY pick_number`,
		[userId, roomId]
	);
	return roster.rows;
}