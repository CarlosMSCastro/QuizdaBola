const axios = require('axios');
const db = require('./config/db');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const season = 2024;

const teams = [
    231, 240, 242,
    762, 810, 4716, 15130, 21595
];

// pausa entre pedidos à API para não exceder o limite
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function scrape() {
    let inserted = 0;

    for (const team_id of teams) {
        let page = 1;
        let total_pages = 1;

        do {
            const { data } = await axios.get(
                'https://v3.football.api-sports.io/players',
                {
                    params: { team: team_id, season, page },
                    headers: { 'x-apisports-key': API_KEY }
                }
            );

            total_pages = data.paging.total;
            if (!data.response.length) break;

            for (const item of data.response) {
                const p = item.player;
                const s = item.statistics[0] ?? {};
                const games = s.games ?? {};

                // calcular dificuldade com base nas aparições
                const appearences = games.appearences ?? null;
                let difficulty = 'hard';
                if (appearences >= 20) difficulty = 'easy';
                else if (appearences >= 10) difficulty = 'medium';

                await db.execute(
                    `INSERT INTO players (
                        id, name, firstname, lastname, age,
                        birth_date, birth_place, birth_country,
                        nationality, height, weight, injured, photo,
                        team_id, team_name, team_logo, season,
                        position, appearences, lineups, minutes, rating, captain,
                        substitutes_in, substitutes_out, bench,
                        shots_total, shots_on,
                        goals_total, goals_conceded, goals_assists, goals_saves,
                        passes_total, passes_key, passes_accuracy,
                        tackles_total, tackles_blocks, tackles_interceptions,
                        duels_total, duels_won,
                        dribbles_attempts, dribbles_success, dribbles_past,
                        fouls_drawn, fouls_committed,
                        cards_yellow, cards_yellowred, cards_red,
                        penalty_scored, penalty_missed,
                        difficulty
                    ) VALUES (
                        ?, ?, ?, ?, ?,
                        ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?,
                        ?, ?, ?, ?, ?, ?,
                        ?, ?, ?,
                        ?, ?,
                        ?, ?, ?, ?,
                        ?, ?, ?,
                        ?, ?, ?,
                        ?, ?,
                        ?, ?, ?,
                        ?, ?,
                        ?, ?, ?,
                        ?, ?,
                        ?
                    ) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                    [
                        p.id,
                        p.name,
                        p.firstname ?? null,
                        p.lastname ?? null,
                        p.age ?? null,
                        p.birth?.date ?? null,
                        p.birth?.place ?? null,
                        p.birth?.country ?? null,
                        p.nationality ?? null,
                        p.height ?? null,
                        p.weight ?? null,
                        p.injured ? 1 : 0,
                        p.photo ?? null,
                        s.team?.id ?? null,
                        s.team?.name ?? null,
                        s.team?.logo ?? null,
                        season,
                        games.position ?? null,
                        games.appearences ?? null,
                        games.lineups ?? null,
                        games.minutes ?? null,
                        games.rating ?? null,
                        games.captain ? 1 : 0,
                        s.substitutes?.in ?? null,
                        s.substitutes?.out ?? null,
                        s.substitutes?.bench ?? null,
                        s.shots?.total ?? null,
                        s.shots?.on ?? null,
                        s.goals?.total ?? null,
                        s.goals?.conceded ?? null,
                        s.goals?.assists ?? null,
                        s.goals?.saves ?? null,
                        s.passes?.total ?? null,
                        s.passes?.key ?? null,
                        s.passes?.accuracy ?? null,
                        s.tackles?.total ?? null,
                        s.tackles?.blocks ?? null,
                        s.tackles?.interceptions ?? null,
                        s.duels?.total ?? null,
                        s.duels?.won ?? null,
                        s.dribbles?.attempts ?? null,
                        s.dribbles?.success ?? null,
                        s.dribbles?.past ?? null,
                        s.fouls?.drawn ?? null,
                        s.fouls?.committed ?? null,
                        s.cards?.yellow ?? null,
                        s.cards?.yellowred ?? null,
                        s.cards?.red ?? null,
                        s.penalty?.scored ?? null,
                        s.penalty?.missed ?? null,
                        difficulty
                    ]
                );

                inserted++;
            }

            console.log(`Equipa ${team_id} - Página ${page}/${total_pages} processada`);
            await sleep(10000); // aguarda 10s entre pedidos
            page++;

        } while (page <= total_pages);
    }

    console.log(`Concluído! ${inserted} jogadores inseridos.`);
}

scrape().catch(console.error);