export interface Player {
    first_name: string;
	last_name: string;
	player_age: number;
	player_id: number;
	team_id: number;
	is_utility: boolean;
}

export interface RosterRules {
    utility_slots: number;
    bench_slots: number;
}

export interface BasketballRosterRules extends RosterRules {
    pointguard_slots: number;
    shootingguard_slots: number;
    guard_slots: number;
    smallforward_slots: number;
    powerforward_slots: number;
    forward_slots: number;
    center_slots: number;
}

export interface BasketballPlayer extends Player {
	is_pointguard: boolean;
	is_shootingguard: boolean;
	is_guard: boolean;
	is_smallforward: boolean;
	is_powerforward: boolean;
	is_forward: boolean;
	is_center: boolean;
}

export interface BasketballPlayerPreviousSeasonStats extends BasketballPlayer {
	rank_number: number;
	games_played: number;
	minutes_played: number;
	points_total: number;
	rebounds_total: number;
	assists_total: number;
}

export interface RosterList {
	utility: (Player | null)[];
	bench: (Player | null)[];
}

export interface BasketballRosterList extends RosterList {
	pointguard: (BasketballPlayer | null)[];
	shootingguard: (BasketballPlayer | null)[];
	guard: (BasketballPlayer | null)[];
	smallforward: (BasketballPlayer | null)[];
	powerforward: (BasketballPlayer | null)[];
	forward: (BasketballPlayer | null)[];
	center: (BasketballPlayer | null)[];
}

// Abstract class Roster with generic types and getter and setter methods
export abstract class Roster<T extends RosterList, U extends RosterRules> {
    // Protected properties for the roster list and roster rules
    protected rosterList?: T
    protected rosterRules: U;

    // Getter for the rosterList property
    public getRosterList(): T | undefined {
        return this.rosterList;
    }

    // Setter for the rosterList property
    public setRosterList(list: T) {
        this.rosterList = list;
    }

    // Roster constructor
    constructor(rosterRules: U) {
        this.rosterRules = rosterRules;
    }

    // Abstract method for shifting players within the roster
    protected abstract shiftPlayer(player: Player, currentSpot: keyof T, currentSpotIndex: number): boolean;

    // Abstract method for adding players to the roster
    public abstract addPlayer(player: Player): boolean;

	public addPlayers(players: Player[]) {
		players.forEach((player: Player) => {
			this.addPlayer(player);
		});
	}
}