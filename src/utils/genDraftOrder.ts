export function genSnakeDraftOrder(teamCount: number, teamSize: number): number[] {
    let draftOrder: number[] = [];
   
    const forwardDirection = [...Array(teamCount)].map((_, index) => 1 + index);
    const reverseDirection = [...forwardDirection].reverse();
  
    for (let i=0; i < teamSize; i++) {
      if (i%2 == 0) {
        draftOrder = draftOrder.concat(forwardDirection);
      }
      else {
        draftOrder = draftOrder.concat(reverseDirection);
      }
    }
  
    return draftOrder.slice(0, teamCount*teamSize);
  }
  
  export function genLinearDraftOrder(teamCount: number, teamSize: number): number[] {
    let draftOrder: number[] = [];
  
    const roundOrder = [...Array(teamCount)].map((_, index) => 1 + index);
  
    for (let i=0; i < teamSize; i++) {
      draftOrder = draftOrder.concat(roundOrder);
    }
  
    return draftOrder;
  }