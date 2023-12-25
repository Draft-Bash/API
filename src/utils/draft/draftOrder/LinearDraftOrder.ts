import { IDraftOrder } from "./IDraftOrder";

export class LinearDraftOrder implements IDraftOrder {

    generateDraftOrder(teamCount: number, teamSize: number): number[] {
        // Initialize an empty array to store the draft order.
        let draftOrder: number[] = [];

        // Generate an array `roundOrder` representing the order of teams for a single round.
        // Each element represents a team's order, starting from 1 and incrementing by 1 for each team.
        const roundOrder = [...Array(teamCount)].map((_, index) => 1 + index);

        // Loop for each round of the draft (teamSize rounds in total).
        for (let i = 0; i < teamSize; i++) {
            // Add the `roundOrder` to the `draftOrder` for each round.
            // This represents a linear draft order where teams pick in the same order in every round.
            draftOrder = draftOrder.concat(roundOrder);
        }

        // Return the draft order.
        return draftOrder;
    }
}