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
	first_name: string;
	last_name: string;
	team_abbreviation: string;
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
		ORDER BY D.pick_number ASC;
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

export async function dequeuePick(draftId: string, userId: number) {
    const userPicks = await db.query(
        `SELECT *
        FROM draft_pick AS D
        INNER JOIN nba_player AS P
        ON D.player_id = P.player_id
        WHERE D.picked_by_user_id = $1 AND D.draft_id = $2`,
        [Number(userId), Number(draftId)]
    );

    const draftRules = await fetchDraftSettings(draftId);
    const rosterSpots = {
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

    userPicks.rows.forEach((player: Player) => {
        addPlayer(player, rosterSpots);
    });

    try {
        const queuedPlayers = await db.query(
            `SELECT * 
            FROM pick_queue AS Q
            INNER JOIN nba_player AS P
            ON Q.player_id = P.player_id
            WHERE Q.draft_id = $1 AND Q.user_id = $2
            ORDER BY rank;`,
            [draftId, userId]
        );

        for (let i = 0; i < queuedPlayers.rows.length; i++) {
            let tempRoster = JSON.parse(JSON.stringify(rosterSpots));
            const player = queuedPlayers.rows[i];

            if (addPlayer(player, tempRoster)) {
                await db.query(
                    `INSERT INTO draft_pick (player_id, draft_id, picked_by_user_id, picked_by_bot_number, pick_number)
                    VALUES ($1, $2, $3, $4, COALESCE((SELECT MAX(pick_number) + 1 FROM draft_pick WHERE draft_id = $2), 1))`,
                    [player.player_id, draftId, userId, null]
                );

                await db.query(
                    `DELETE FROM pick_queue
                    WHERE player_id = $1 AND draft_id = $2;`,
                    [player.player_id, draftId]
                );

                await db.query(
                    `DELETE FROM draft_order 
                    WHERE draft_order_id = (SELECT MIN(draft_order_id) FROM draft_order WHERE draft_id = $1)`,
                    [draftId]
                );
				if (queuedPlayers.rows.length > 1 && !addPlayer(queuedPlayers.rows[i + 1], tempRoster)) {
					for (let j = 0; j < queuedPlayers.rows.length; j++) {
						const player = queuedPlayers.rows[j];
						const newTempRoster = JSON.parse(JSON.stringify(tempRoster));
						if (!addPlayer(player, newTempRoster)) {
							await db.query(
								`DELETE FROM pick_queue
								WHERE player_id = $1 AND draft_id = $2;`,
								[player.player_id, draftId]
							);
						}
					}
				}
				
                return true;
            } else {
                await db.query(
                    `DELETE FROM pick_queue
                    WHERE player_id = $1 AND draft_id = $2;`,
                    [player.player_id, draftId]
                );
            }
        }

        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}