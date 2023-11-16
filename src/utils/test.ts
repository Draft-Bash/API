const axios = require('axios');
const cheerio = require('cheerio');
const db = require("../db");

interface NewsData {
    injuryStatus: string | null | undefined;
    fantasyOutlook: string | null | undefined;
    date: string | null | undefined;
    summary: string | null | undefined;
    analysis: string | null | undefined;
    playerTeam: string | null | undefined;
    title: string | null | undefined;
    playerAge: number | null | undefined;
}

export async function test() {

    try {
        const response = await axios.get(`https://www.rotowire.com/basketball/player/james-harden-3018`);
        const $ = cheerio.load(response.data);

        const injuryStatus = $('.tag.is-red.is-sm.bold').first().text().trim().toUpperCase();
        const fantasyOutlook = $('.p-card__outlook-text').first().text().trim().split('.').slice(0, -1).join('.') + '.';
        const title = $('.news-update__headline').first().text().trim();
        const date = $('.news-update__timestamp').first().text().trim();
        const summary = $('.news-update__news').first().text().trim();
        const analysis = $('.news-update__analysis').first().text().replace('ANALYSIS', "");
        const playerTeam = $('.p-card__player-info a').first().text().trim().split(" ").pop();
        const playerAge = Number($('.p-card__player-info div').first().text().split('-')[0]);

        const news: NewsData = {
            injuryStatus,
            fantasyOutlook,
            title,
            date,
            summary,
            analysis,
            playerTeam,
            playerAge,
        };

        if (news.playerAge && news.playerTeam) {
            await db.query(`
                UPDATE nba_player SET player_age = $1, team_id=(
                    SELECT team_id FROM nba_team WHERE team_name = $2 LIMIT 1
                    ) WHERE player_id = $3`,
                [news.playerAge, news.playerTeam, 201935]
            );
        }

        await db.query(`
            UPDATE nba_player_news SET title=$1, summary=$2, analysis=$3, news_date=$4, injury_status=$5,fantasy_outlook=$6 
            WHERE player_id=$7`, [
            news.title,
            news.summary,
            news.analysis,
            news.date,
            news.injuryStatus,
            news.fantasyOutlook,
            201935
        ]);
        return 200
    } catch (error) {
        return error
    }
}