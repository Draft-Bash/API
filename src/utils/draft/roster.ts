import { RosterList, BasketballRosterList, Player, BasketballPlayer, RosterRules,
BasketballRosterRules, Roster} from "./types";

// BasketballRoster class definition
export class BasketballRoster extends Roster<BasketballRosterList, BasketballRosterRules> {
    // Constructor for the BasketballRoster class
    constructor(rosterRules: BasketballRosterRules, initialRosterList?: BasketballRosterList) {
        // If an initial roster list is provided, call the super constructor with the initial list
        if (initialRosterList) {
            super(rosterRules as BasketballRosterRules);
        }
        // Otherwise, create an empty basketball roster list and call the super constructor
        else {
            const emptyBasketballRosterList: BasketballRosterList = {
                // Initialize empty slots for different positions based on roster rules
                pointguard: Array.from({ length: rosterRules.pointguard_slots }, () => null),
                shootingguard: Array.from({ length: rosterRules.shootingguard_slots }, () => null),
                guard: Array.from({ length: rosterRules.guard_slots }, () => null),
                smallforward: Array.from({ length: rosterRules.smallforward_slots }, () => null),
                powerforward: Array.from({ length: rosterRules.powerforward_slots }, () => null),
                forward: Array.from({ length: rosterRules.forward_slots }, () => null),
                center: Array.from({ length: rosterRules.center_slots }, () => null),
                utility: Array.from({ length: rosterRules.utility_slots }, () => null),
                bench: Array.from({ length: rosterRules.bench_slots }, () => null)
            };
            super(rosterRules);
            this.rosterList = emptyBasketballRosterList
        }
    }

    // Method for shifting players within the basketball roster
    protected shiftPlayer(player: BasketballPlayer, currentSpot: keyof BasketballRosterList, currentSpotIndex: number): boolean {
        // Return false if the roster list doesn't exist
        if (!this.rosterList) return false;

        // Check various conditions for shifting based on player and current spot information
        const isPlayerPosition = player[`is_${currentSpot}` as keyof BasketballPlayer];
        const isBenchOrUtility = currentSpot === "bench" || currentSpot === "utility";
        const isGuardPosition = (player.is_pointguard || player.is_shootingguard) && currentSpot === "guard";
        const isForwardPosition = (player.is_smallforward || player.is_powerforward) && currentSpot === "forward";

        // Logic for shifting players within the roster
        for (const position of Object.keys(this.rosterList) as Array<keyof BasketballRosterList>) {
            if (isPlayerPosition || isBenchOrUtility || isGuardPosition || isForwardPosition) {
                let emptyIndex: number = this.rosterList[position].findIndex((slot) => slot === null);
                if (emptyIndex !== -1) {
                    this.rosterList[position][emptyIndex] = player;
                    this.rosterList[currentSpot][currentSpotIndex] = null;
                    return true;
                }
            }
        }
        return false;
    }

    // Method for adding players to the basketball roster
    public addPlayer(player: BasketballPlayer): boolean {
        // Return false if the roster list doesn't exist
        if (!this.rosterList) return false;

        // Logic for adding players to the basketball roster
        for (const position of Object.keys(this.rosterList) as Array<keyof BasketballRosterList>) {
            if (
                player[`is_${position}` as keyof BasketballPlayer] ||
                position === "bench" ||
                position === "utility" ||
                ((player.is_pointguard || player.is_shootingguard) &&
                position === "guard") ||
                ((player.is_smallforward || player.is_powerforward) &&
                position === "forward")
            ) {
                let emptyIndex = this.rosterList[position].findIndex((slot) => slot === null);
                if (emptyIndex !== -1) {
                this.rosterList[position][emptyIndex] = player;
                return true;
                } else {
                for (let i = 0; i < this.rosterList[position].length; i++) {
                    if (
                    this.rosterList[position][i] &&
                    this.shiftPlayer(
                        this.rosterList[position][i] as BasketballPlayer,
                        position,
                        i
                    )
                    ) {
                    this.rosterList[position][i] = player;
                    return true;
                    }
                }
                }
            }
            }
        return false;
    }
}