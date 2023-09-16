export function genSnakeDraftOrder(teamCount: number, teamSize: number): number[] {
  // Initialize an empty array to store the draft order.
  let draftOrder: number[] = [];
 
  // Generate an array representing the forward direction of team order, e.g., [1, 2, 3, ...]
  const forwardDirection = [...Array(teamCount)].map((_, index) => 1 + index);
  
  // Generate an array representing the reverse direction of team order, e.g., [..., 3, 2, 1]
  const reverseDirection = [...forwardDirection].reverse();

  // Loop for each round of the draft (teamSize rounds in total).
  for (let i = 0; i < teamSize; i++) {
    // If it's an even round (0-based index), add teams in the forward direction.
    if (i % 2 == 0) {
      draftOrder = draftOrder.concat(forwardDirection);
    }
    // If it's an odd round, add teams in the reverse direction.
    else {
      draftOrder = draftOrder.concat(reverseDirection);
    }
  }

  /*Return the draft order, limiting it to the desired number of teams and rounds.
  For example, if there are 10 teams, a snake draft order might look like this:
  [1,2,3,4,5,6,7,8,9,10,10,9,8,7,6,5,4,3,2,1,1,2,3,4,5,6,7,8,9,10,..]*/ 
  return draftOrder.slice(0, teamCount * teamSize);
}
  
export function genLinearDraftOrder(teamCount: number, teamSize: number): number[] {
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