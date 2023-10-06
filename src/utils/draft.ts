const db = require("../db");

export interface DraftTurn {
	username: string;
	draft_order_id: number;
	user_id: number;
	draft_id: number;
	bot_number: number;
	pick_number: number;
}

// Define the DraftRoster interface or type
export interface DraftRoster {
	pointguard: (Player | null)[];
	shootingguard: (Player | null)[];
	guard: (Player | null)[];
	smallforward: (Player | null)[];
	powerforward: (Player | null)[];
	forward: (Player | null)[];
	center: (Player | null)[];
	utility: (Player | null)[];
	bench: (Player | null)[];
}

export interface DraftPick {
	user_draft_order_id: number;
	user_id: number;
	draft_id: number;
	bot_number: number;
	pick_number: number;
	username: string;
}

// Define the Player interface
export interface Player {
	first_name: string;
	last_name: string;
	player_age: number;
	player_id: number;
	team_id: number;
	is_pointguard: boolean;
	is_shootingguard: boolean;
	is_guard: boolean;
	is_smallforward: boolean;
	is_powerforward: boolean;
	is_forward: boolean;
	is_center: boolean;
	is_utility: boolean;
}

export interface PlayerPreviousSeasonStats extends Player {
	rank_number: number;
	games_played: number;
	minutes_played: number;
	points_total: number;
	rebounds_total: number;
	assists_total: number;
}

// Define the function to shift a player
export function shiftPlayer(
	player: Player,
	currentSpot: keyof DraftRoster,
	currentSpotIndex: number,
	rosterSpots: DraftRoster
): boolean {
	for (const position of Object.keys(rosterSpots) as Array<keyof DraftRoster>) {
		if (
			player[`is_${position}` as keyof Player] ||
			position === "bench" ||
			position === "utility" ||
			((player.is_pointguard || player.is_shootingguard) &&
				position === "guard") ||
			((player.is_smallforward || player.is_powerforward) &&
				position === "forward")
		) {
			let emptyIndex = rosterSpots[position].findIndex((slot) => slot === null);
			if (emptyIndex !== -1) {
				rosterSpots[position][emptyIndex] = player;
				rosterSpots[currentSpot][currentSpotIndex] = null;
				return true;
			}
		}
	}
	return false;
}

export function addPlayer(player: Player, rosterSpots: DraftRoster) {
	for (const position of Object.keys(rosterSpots) as Array<keyof DraftRoster>) {
		if (
			player[`is_${position}` as keyof Player] ||
			position === "bench" ||
			position === "utility" ||
			((player.is_pointguard || player.is_shootingguard) &&
				position === "guard") ||
			((player.is_smallforward || player.is_powerforward) &&
				position === "forward")
		) {
			let emptyIndex = rosterSpots[position].findIndex((slot) => slot === null);
			if (emptyIndex !== -1) {
				rosterSpots[position][emptyIndex] = player;
				return true;
			} else {
				for (let i = 0; i < rosterSpots[position].length; i++) {
					if (
						rosterSpots[position][i] &&
						shiftPlayer(
							rosterSpots[position][i] as Player,
							position,
							i,
							rosterSpots
						)
					) {
						rosterSpots[position][i] = player;
						return true;
					}
				}
			}
		}
	}
	return false;
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
    WHERE D.picked_by_user_id = $1 AND D.draft_id = $2`,
		[userId, roomId]
	);
	return roster.rows;
}