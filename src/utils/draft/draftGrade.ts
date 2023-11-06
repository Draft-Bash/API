import { FantasyPointConverter } from "../fantasyPointConverter";
const db = require('../../db');

interface UserPicksSummary {
    points: number;
    rebounds: number;
    assists: number;
    blocks: number;
    steals: number;
    turnovers: number;
    picked_by_user_id: number;
}

interface UserTotalFanPts {
    userId: number;
    fanPts: number;
}

export async function getUserDraftGrade(userId: number, draftId: number) {
    const fanPtConverter = new FantasyPointConverter(1,1,4,4,-2,2);
    const userPicks = await db.query(
        `SELECT SUM(P.points_total) AS points, 
        SUM(P.rebounds_total) AS rebounds,
        SUM(P.assists_total) AS assists, 
        SUM(P.blocks_total) AS blocks, 
        SUM(P.steals_total) AS steals, 
        SUM(P.turnovers_total) AS turnovers,
        DP.picked_by_user_id,
        DP.picked_by_bot_number
        FROM draft_pick AS DP
        INNER JOIN nba_player_projections AS P
        ON DP.player_id=P.player_id
        WHERE draft_id = $1
        GROUP BY 
        DP.picked_by_user_id,
        DP.picked_by_bot_number;`, [
            Number(draftId)
        ]
    );

    let usersTotalFanPts: UserTotalFanPts[] = []
    userPicks.rows.forEach((userPicksSummary: UserPicksSummary) => {
        usersTotalFanPts.push({
            userId: userPicksSummary.picked_by_user_id,
            fanPts: fanPtConverter.convert(userPicksSummary.rebounds, 
                userPicksSummary.points, userPicksSummary.blocks,
                userPicksSummary.steals, userPicksSummary.turnovers,
                userPicksSummary.assists)
        });
    })

    usersTotalFanPts.sort((a, b) => a.fanPts - b.fanPts);
    const index = usersTotalFanPts.findIndex(row => row.userId==userId);
    const percentile = (index+1)/usersTotalFanPts.length;
    let grade: string = '';

    if (percentile >= .8) {
        grade =  'A';
    } else if (percentile >= .6) {
        grade = 'B';
    } else if (percentile >= .4) {
        grade = 'C';
    } else if (percentile >= .2) {
        grade = 'D';
    } else {
        grade = 'F';
    }

    return {grade: grade, rank: usersTotalFanPts.length-index, totalFanPts: usersTotalFanPts[0].fanPts}
}