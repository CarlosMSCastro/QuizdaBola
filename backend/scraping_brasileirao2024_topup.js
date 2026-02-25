const axios = require('axios');
const db = require('./config/db');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const season = 2024;
const LEAGUE_ID = 71; // Brasileirão Serie A

// Todos os 20 teams do Brasileirão 2024
const teams = [
    118,  // Bahia
    119,  // Internacional
    120,  // Botafogo
    121,  // Palmeiras ⭐
    124,  // Fluminense
    126,  // Sao Paulo ⭐
    127,  // Flamengo ⭐
    130,  // Gremio
    131,  // Corinthians ⭐
    133,  // Vasco DA Gama
    134,  // Atletico Paranaense
    135,  // Cruzeiro
    136,  // Vitoria
    140,  // Criciuma
    144,  // Atletico Goianiense
    152,  // Juventude
    154,  // Fortaleza EC
    794,  // RB Bragantino
    1062, // Atletico-MG ⭐
    1193  // Cuiaba
];

const normalizeHeight = (height) => {
    if (!height) return null;
    const match = height.match(/\d+/);
    return match ? parseInt(match[0]) : null;
};

const normalizeWeight = (weight) => {
    if (!weight) return null;
    const match = weight.match(/\d+/);
    return match ? parseInt(match[0]) : null;
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function scrapeFromPage4() {
    let inserted = 0;
    let skipped = 0;
    let noMorePages = 0;

    for (const team_id of teams) {
        let page = 4; // ← COMEÇA NA PÁGINA 4
        let total_pages = 10; // Assume máximo inicial

        // Primeiro request para descobrir total_pages real
        try {
            const { data: firstData } = await axios.get(
                'https://v3.football.api-sports.io/players',
                {
                    params: { team: team_id, season, page: 1 },
                    headers: { 'x-apisports-key': API_KEY }
                }
            );
            total_pages = firstData.paging.total;
            console.log(`Equipa ${team_id}: ${total_pages} páginas totais`);
            
            // Se só tem 3 ou menos páginas, skip
            if (total_pages <= 3) {
                console.log(`  ⏭️  Skip (já processado nas páginas 1-3)`);
                noMorePages++;
                await sleep(10000);
                continue;
            }
        } catch (error) {
            console.error(`Erro ao verificar equipa ${team_id}:`, error.message);
            await sleep(10000);
            continue;
        }

        // Processar páginas 4+
        do {
            try {
                const { data } = await axios.get(
                    'https://v3.football.api-sports.io/players',
                    {
                        params: { team: team_id, season, page },
                        headers: { 'x-apisports-key': API_KEY }
                    }
                );

                if (!data.response.length) break;

                for (const item of data.response) {
                    const p = item.player;
                    
                    const serieAStats = item.statistics.find(stat => stat.league.id === LEAGUE_ID);
                    
                    if (!serieAStats) {
                        skipped++;
                        continue;
                    }

                    const s = serieAStats;
                    const games = s.games ?? {};

                    const appearences = games.appearences ?? null;
                    let difficulty = 'hard';
                    if (appearences >= 20) difficulty = 'easy';
                    else if (appearences >= 10) difficulty = 'medium';

                    await db.execute(
                        `INSERT INTO players_brasileirao2024 (
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
                            normalizeHeight(p.height),
                            normalizeWeight(p.weight),
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
                await sleep(10000);
                page++;

            } catch (error) {
                console.error(`Erro na equipa ${team_id}, página ${page}:`, error.message);
                break;
            }

        } while (page <= total_pages);
    }

    console.log(`\n✅ Top-Up Concluído!`);
    console.log(`📊 ${inserted} novos jogadores inseridos`);
    console.log(`⏭️  ${skipped} jogadores sem stats na Serie A (skipped)`);
    console.log(`🚫 ${noMorePages} equipas sem páginas 4+ (já completas)`);
}

scrapeFromPage4().catch(console.error);