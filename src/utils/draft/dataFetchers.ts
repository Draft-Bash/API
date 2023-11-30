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
		`SELECT T.assists_total, T.blocks_total,
		T.fieldgoals_attempted, T.threes_made, T.threes_attempted,
		T.fieldgoals_made, T.games_played, T.points_total, T.minutes_played,
		T.rebounds_total, T.steals_total, T.turnovers_total, NT.city_name, NT.team_name, NT.team_id,
		NT.team_abbreviation, P.first_name, P.last_name,P.is_center, P.is_pointguard, P.is_powerforward, 
		P.is_shootingguard, P.is_smallforward, P.player_age, P.player_id, R.rank_number,
		PP.points_total AS projected_points,
		PP.rebounds_total AS projected_rebounds, PP.assists_total AS projected_assists,
		PP.blocks_total AS projected_blocks, PP.steals_total AS projected_steals,
		PP.fieldgoal_percentage AS projected_fieldgoal_percentage,
		PP.games_played AS projected_games_played, PP.minutes_played AS projected_minutes_played,
		PP.turnovers_total AS projected_turnovers, PP.threepointers_total AS projected_threepointers,
		N.news_date, N.injury_status, N.analysis, N.summary, N.title, N.fantasy_outlook, 
		U.user_id, U.username, D.picked_by_user_id, D.picked_by_bot_number, D.pick_number
		FROM draft_pick AS D
		LEFT JOIN points_draft_ranking AS R
		ON D.player_id = R.player_id
		LEFT JOIN nba_player as P
		ON R.player_id = P.player_id
		LEFT JOIN nba_player_season_totals AS T
		ON P.player_id = T.player_id
		LEFT JOIN nba_team AS NT
		ON P.team_id = NT.team_id
		LEFT JOIN nba_player_projections AS PP
		ON P.player_id = PP.player_id
		LEFT JOIN nba_player_news AS N
		ON P.player_id = N.player_id
		LEFT JOIN user_account AS U
		ON D.picked_by_user_id = U.user_id
		WHERE D.draft_id = $1
		ORDER BY D.pick_number ASC;
		`, [draftId]
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

	const draftType = await db.query(
		`SELECT scoring_type FROM draft WHERE draft_id = $1;`,
		[roomId]
	);

	let availablePlayers = await db.query(
		`SELECT T.assists_total, T.blocks_total,
		T.fieldgoals_attempted, T.threes_made, T.threes_attempted,
		T.fieldgoals_made, T.games_played, T.points_total, T.minutes_played,
		T.rebounds_total, T.steals_total, T.turnovers_total, NT.city_name, NT.team_name, NT.team_id,
		NT.team_abbreviation, P.first_name, P.last_name,P.is_center, P.is_pointguard, P.is_powerforward, 
		P.is_shootingguard, P.is_smallforward, P.player_age, P.player_id, R.rank_number,
		PP.points_total AS projected_points,
		PP.rebounds_total AS projected_rebounds, PP.assists_total AS projected_assists,
		PP.blocks_total AS projected_blocks, PP.steals_total AS projected_steals,
		PP.fieldgoal_percentage AS projected_fieldgoal_percentage,
		PP.games_played AS projected_games_played, PP.minutes_played AS projected_minutes_played,
		PP.turnovers_total AS projected_turnovers, PP.threepointers_total AS projected_threepointers,
		N.news_date, N.injury_status, N.analysis, N.summary, N.title, N.fantasy_outlook
		FROM ${draftType.rows[0].scoring_type}_draft_ranking AS R
		INNER JOIN nba_player as P
		ON R.player_id = P.player_id
		INNER JOIN nba_player_season_totals AS T
		ON P.player_id = T.player_id
		INNER JOIN nba_team AS NT
		ON P.team_id = NT.team_id
		LEFT JOIN nba_player_projections AS PP
		ON P.player_id = PP.player_id
		LEFT JOIN nba_player_news AS N
		ON P.player_id = N.player_id
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
		`SELECT T.assists_total, T.blocks_total,
		T.fieldgoals_attempted, T.threes_made, T.threes_attempted,
		T.fieldgoals_made, T.games_played, T.points_total, T.minutes_played,
		T.rebounds_total, T.steals_total, T.turnovers_total, NT.city_name, NT.team_name, NT.team_id,
		NT.team_abbreviation, P.first_name, P.last_name,P.is_center, P.is_pointguard, P.is_powerforward, 
		P.is_shootingguard, P.is_smallforward, P.player_age, P.player_id, R.rank_number,
		PP.points_total AS projected_points,
		PP.rebounds_total AS projected_rebounds, PP.assists_total AS projected_assists,
		PP.blocks_total AS projected_blocks, PP.steals_total AS projected_steals,
		PP.fieldgoal_percentage AS projected_fieldgoal_percentage,
		PP.games_played AS projected_games_played, PP.minutes_played AS projected_minutes_played,
		PP.turnovers_total AS projected_turnovers, PP.threepointers_total AS projected_threepointers,
		N.news_date, N.injury_status, N.analysis, N.summary, N.title, N.fantasy_outlook,
		D.picked_by_bot_number, D.picked_by_user_id, D.draft_id, D.pick_number
		FROM nba_player AS P
		LEFT JOIN points_draft_ranking as R
		ON R.player_id = P.player_id
		LEFT JOIN nba_player_season_totals AS T
		ON P.player_id = T.player_id
		LEFT JOIN nba_team AS NT
		ON P.team_id = NT.team_id
		LEFT JOIN nba_player_projections AS PP
		ON P.player_id = PP.player_id
		LEFT JOIN nba_player_news AS N
		ON P.player_id = N.player_id
		LEFT JOIN draft_pick AS D
		ON P.player_id = D.player_id
		LEFT JOIN user_account AS U
		ON D.picked_by_user_id = U.user_id
    WHERE D.picked_by_user_id = $1 AND D.draft_id = $2
	ORDER BY pick_number ASC`,
		[userId, roomId]
	);
	return roster.rows;
}