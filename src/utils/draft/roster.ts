import { DraftRoster } from "../draft";
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

    protected shiftPlayer(
        player: Player,
        currentSpot: keyof DraftRoster,
        currentSpotIndex: number
    ): boolean {
        if (this.rosterList) {
            for (const position of Object.keys(this.rosterList) as Array<keyof DraftRoster>) {
                if (
                    player[`is_${String(position)}` as keyof Player] ||
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
                        this.rosterList[currentSpot][currentSpotIndex] = null;
                        return true;
                    }
                }
            }
            return false;
        }
        else {
            return false;
        }
    }

    // Method for adding players to the basketball roster
    public addPlayer(player: Player): boolean {
        if (this.rosterList) {
            for (const position of Object.keys(this.rosterList) as Array<keyof DraftRoster>) {
                if (
                  player[`is_${position}` as keyof Player] ||
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
                        this.shiftPlayer(this.rosterList[position][i] as Player, position, i)
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
        else {
            return false;
        }
    }
}