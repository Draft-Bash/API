
import * as puppeteer from 'puppeteer';
import { Player } from './draft';
const db = require("../db");

interface NewsData {
    injuryStatus: string | null | undefined;
    fantasyOutlook: string | null | undefined;
    date: string | null |  undefined;
    summary: string | null | undefined;
    analysis: string | null | undefined;
    playerTeam: string | null | undefined;
    title: string | null | undefined;
    playerAge: number | null | undefined
}

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const players = await db.query(`
        SELECT first_name, last_name, P.player_id, rotowire_id 
        FROM nba_player AS P
        INNER JOIN nba_player_news AS N
        ON P.player_id = N.player_id;`
    );

    for (const player of players.rows) {
        try {
            await page.goto(`https://www.rotowire.com/basketball/player/${player.first_name.toLowerCase()}-${player.last_name.toLowerCase()}-${player.rotowire_id}`);
        
            const news: NewsData = await page.evaluate(() => {
                const injuryStatus = document.querySelector('.tag.is-red.is-sm.bold')?.textContent?.trim();
                const fantasyOutlook = document.querySelector('.p-card__outlook-text')?.textContent?.trim().split('.').slice(0, -1).join('.')+'.';
                const title = document.querySelector('.news-update__headline')?.textContent?.trim();
                const date = document.querySelector('.news-update__timestamp')?.textContent?.trim();
                const summary = document.querySelector('.news-update__news')?.textContent?.trim();
                const analysis = document.querySelector('.news-update__analysis')?.textContent?.replace('ANALYSIS', "");
                const playerTeam = document.querySelector('.p-card__player-info a')?.textContent?.trim().split(" ").pop();
                const playerAge = Number(document.querySelector('.p-card__player-info div')?.textContent?.split('-')[0])
                
                return {
                    injuryStatus: injuryStatus, fantasyOutlook: fantasyOutlook,
                    title: title, date: date, summary: summary, playerAge: playerAge,
                    analysis: analysis, playerTeam: playerTeam,
                };
            });
        
            await db.query(`
                UPDATE nba_player SET player_age = $1, team_id=(
                    SELECT team_id FROM nba_team WHERE team_name = $2 LIMIT 1
                    ) WHERE player_id = $3`, 
                [news.playerAge, news.playerTeam, 201935]
            );
        
            await db.query(`
                UPDATE nba_player_news SET title=$1, summary=$2, analysis=$3, news_date=$4, injury_status=$5,fantasy_outlook=$6 
                WHERE player_id=$7`, [
                news.title, 
                news.summary, 
                news.analysis, 
                news.date, 
                news.injuryStatus, 
                news.fantasyOutlook,
                player.player_id
            ]);
        } catch (error) {
            console.log(error)
        }

        // Adding a delay of 6 seconds between each iteration
        await new Promise(resolve => setTimeout(resolve, 10000));
    }

    await browser.close();
}

run();