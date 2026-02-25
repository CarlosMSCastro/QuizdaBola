const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Big 5 teams por competição
const BIG_TEAMS_BY_COMPETITION = {
    'ligaportugal2024': ['Benfica', 'FC Porto', 'Sporting CP', 'Braga', 'Vitória SC'],
    'brasileirao2024': ['Flamengo', 'Palmeiras', 'Corinthians', 'Sao Paulo', 'Atletico-MG']
};

// Filtros de mínimos por competição (mais suaves para Brasileirão)
const MIN_REQUIREMENTS = {
    'ligaportugal2024': { appearences: 5, minutes: 300 },
    'brasileirao2024': { appearences: 3, minutes: 150 }
};

// Stats intuitivas reorganizadas
const STATS_CONFIG = {
    physical: {
        stats: ['height', 'age'],
        minimums: { height: 165, age: 18 },
        positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker', 'Forward']
    },
    attacking: {
        stats: ['goals_total', 'goals_assists'],
        minimums: { goals_total: 1, goals_assists: 1 },
        positions: ['Attacker', 'Midfielder', 'Forward']
    },
    universal: {
        stats: ['rating', 'cards_yellow'],
        minimums: { rating: 6.0, cards_yellow: 0 },
        positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker', 'Forward']
    }
};

const STAT_LABELS = {
    height: { 
        pt: 'altura', 
        en: 'height', 
        unit: 'cm',
        question_pt: 'Quem é mais alto?',
        question_en: 'Who is taller?'
    },
    age: { 
        pt: 'anos', 
        en: 'years old', 
        unit: '',
        question_pt: 'Quem é mais velho?',
        question_en: 'Who is older?'
    },
    goals_total: { 
        pt: 'golos', 
        en: 'goals', 
        unit: '',
        question_pt: 'Quem marcou mais golos?',
        question_en: 'Who scored more goals?'
    },
    goals_assists: { 
        pt: 'assistências', 
        en: 'assists', 
        unit: '',
        question_pt: 'Quem fez mais assistências?',
        question_en: 'Who made more assists?'
    },
    rating: { 
        pt: 'rating', 
        en: 'rating', 
        unit: '',
        question_pt: 'Quem tem melhor rating?',
        question_en: 'Who has a better rating?'
    },
    cards_yellow: { 
        pt: 'cartões amarelos', 
        en: 'yellow cards', 
        unit: '',
        question_pt: 'Quem levou mais cartões amarelos?',
        question_en: 'Who received more yellow cards?'
    }
};

const F3_HELP_MAP = {
    age: { type: 'position' },
    height: { type: 'position' },
    goals_total: { type: 'position' },
    goals_assists: { type: 'position' },
    rating: { type: 'team_name' },
    cards_yellow: { type: 'position' }
};

const randomStat = () => {
    const categories = Object.keys(STATS_CONFIG);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const config = STATS_CONFIG[category];
    const stat = config.stats[Math.floor(Math.random() * config.stats.length)];
    return { stat, category, config };
};

router.get('/', async (req, res) => {
    try {
        const { exclude, competition_id } = req.query;

        const competitionId = competition_id || 'ligaportugal2024';
        const [competitions] = await db.execute(
            'SELECT table_name FROM competitions WHERE id = ? AND active = 1',
            [competitionId]
        );

        if (competitions.length === 0) {
            return res.status(404).json({ error: 'Competição não encontrada' });
        }

        const tableName = competitions[0].table_name;
        
        // Obter Big 5 e mínimos da competição
        const BIG_TEAMS = BIG_TEAMS_BY_COMPETITION[competitionId] || [];
        const minReqs = MIN_REQUIREMENTS[competitionId] || { appearences: 5, minutes: 300 };

        const excludeIds = exclude
            ? exclude.split(',').map(Number).filter(Boolean)
            : [];

        const formatRand = Math.random() * 100;
        const format = formatRand < 80 ? 'F2' : 'F3';

        const diffRand = Math.random() * 100;
        let difficulty;
        if (diffRand < 40) {
            difficulty = 'easy';
        } else if (diffRand < 75) {
            difficulty = 'medium';
        } else {
            difficulty = 'hard';
        }

        let { stat, config } = randomStat();
        const minimum = config.minimums[stat];
        const positions = config.positions;

        const excludePlaceholder = `AND is_photo_placeholder = 0`;
        const excludeList = excludeIds.length > 0 ? `AND id NOT IN (${excludeIds.join(',')})` : '';
        const positionFilter = `AND position IN (${positions.map(p => `'${p}'`).join(',')})`;
        const difficultyFilter = `AND difficulty = '${difficulty}'`;
        
        const bigTeamsOrder = BIG_TEAMS.length > 0 ? `
            CASE 
                WHEN team_name IN (${BIG_TEAMS.map(() => '?').join(',')}) 
                THEN 1 
                ELSE 2 
            END
        ` : '1';

        let statColumn = stat;

        if (format === 'F2') {
            const baseFilter = `WHERE appearences >= ${minReqs.appearences} AND minutes >= ${minReqs.minutes} ${excludePlaceholder} ${positionFilter} ${difficultyFilter}`;
            
            let [pool] = await db.execute(`
                SELECT id, name, photo, team_name, team_logo, position, ${stat}, ${statColumn} as stat_value
                FROM ${tableName}
                ${baseFilter}
                AND ${statColumn} IS NOT NULL
                AND ${statColumn} >= ?
                ${excludeList}
                ORDER BY ${bigTeamsOrder}, RAND()
                LIMIT 50
            `, [minimum, ...(BIG_TEAMS.length > 0 ? BIG_TEAMS : [])]);

            if (pool.length < 2) {
                console.log(`[FALLBACK F2] Poucos jogadores com difficulty=${difficulty}, tentando sem filtro de dificuldade...`);
                
                const baseFilterNoDiff = `WHERE appearences >= ${minReqs.appearences} AND minutes >= ${minReqs.minutes} ${excludePlaceholder} ${positionFilter}`;
                
                [pool] = await db.execute(`
                    SELECT id, name, photo, team_name, team_logo, position, ${stat}, ${statColumn} as stat_value
                    FROM ${tableName}
                    ${baseFilterNoDiff}
                    AND ${statColumn} IS NOT NULL
                    AND ${statColumn} >= ?
                    ${excludeList}
                    ORDER BY ${bigTeamsOrder}, RAND()
                    LIMIT 50
                `, [minimum, ...(BIG_TEAMS.length > 0 ? BIG_TEAMS : [])]);
            }

            if (pool.length < 2) {
                console.error(`[ERRO F2] Sem jogadores disponíveis para stat=${stat}`);
                return res.status(404).json({ error: 'Sem jogadores disponíveis' });
            }

            let player1 = null, player2 = null;
            outer: for (let i = 0; i < pool.length; i++) {
                for (let j = i + 1; j < pool.length; j++) {
                    const a = parseFloat(pool[i].stat_value);
                    const b = parseFloat(pool[j].stat_value);
                    
                    if (a === b) continue;
                    
                    const max = Math.max(a, b);
                    const diff = Math.abs(a - b);
                    
                    let isPlausible = false;
                    
                    if (stat === 'age') {
                        isPlausible = diff <= 15 && diff >= 1;
                    } else if (stat === 'height') {
                        isPlausible = diff <= 25 && diff >= 2;
                    } else if (stat === 'rating') {
                        isPlausible = diff <= 2.0 && diff >= 0.01;
                    } else {
                        isPlausible = (diff / max) <= 0.8 && diff >= 1;
                    }
                    
                    if (isPlausible) {
                        player1 = pool[i];
                        player2 = pool[j];
                        break outer;
                    }
                }
            }

            if (!player1 || !player2) {
                console.error(`[ERRO F2] Sem par plausível disponível para stat=${stat}`);
                
                // FALLBACK FINAL: Tentar com age (sempre tem dados)
                if (stat !== 'age') {
                    console.log('[FALLBACK FINAL] Tentando com stat=age...');
                    
                    const ageStat = 'age';
                    const agePositions = STATS_CONFIG.physical.positions;
                    const agePositionFilter = `AND position IN (${agePositions.map(p => `'${p}'`).join(',')})`;
                    
                    [pool] = await db.execute(`
                        SELECT id, name, photo, team_name, team_logo, position, age, age as stat_value
                        FROM ${tableName}
                        WHERE appearences >= ${minReqs.appearences} 
                        AND minutes >= ${minReqs.minutes} 
                        ${excludePlaceholder} 
                        ${agePositionFilter}
                        AND age IS NOT NULL
                        ${excludeList}
                        ORDER BY ${bigTeamsOrder}, RAND()
                        LIMIT 50
                    `, BIG_TEAMS.length > 0 ? BIG_TEAMS : []);
                    
                    // Tentar encontrar par com age
                    outer2: for (let i = 0; i < pool.length; i++) {
                        for (let j = i + 1; j < pool.length; j++) {
                            const a = parseFloat(pool[i].stat_value);
                            const b = parseFloat(pool[j].stat_value);
                            
                            if (a === b) continue;
                            const diff = Math.abs(a - b);
                            
                            if (diff <= 15 && diff >= 1) {
                                player1 = pool[i];
                                player2 = pool[j];
                                stat = ageStat;
                                statColumn = ageStat;
                                break outer2;
                            }
                        }
                    }
                }
                
                if (!player1 || !player2) {
                    return res.status(404).json({ error: 'Sem par plausível disponível' });
                }
            }

            const label = STAT_LABELS[stat];
            const correctId = parseFloat(player1.stat_value) > parseFloat(player2.stat_value) ? player1.id : player2.id;

            const formatValue = (val) => {
                const numVal = parseFloat(val);
                if (stat === 'height') return `${numVal}${label.unit}`;
                if (stat === 'rating') return numVal.toFixed(2);
                return Math.round(numVal);
            };

            const helpData = {
                type: 'reveal',
                player1_id: player1.id,
                player1_value: formatValue(player1.stat_value),
                player2_id: player2.id,
                player2_value: formatValue(player2.stat_value)
            };

            return res.json({
                format: 'F2',
                question_pt: label.question_pt,
                question_en: label.question_en,
                players: [
                    { 
                        id: player1.id, 
                        name: player1.name, 
                        photo: player1.photo, 
                        team_logo: player1.team_logo,
                        statValue: formatValue(player1.stat_value)
                    },
                    { 
                        id: player2.id, 
                        name: player2.name, 
                        photo: player2.photo, 
                        team_logo: player2.team_logo,
                        statValue: formatValue(player2.stat_value)
                    }
                ],
                stat,
                correctAnswer: correctId,
                helpData,
                options: null
            });

        } else {
            // === F3: VERDADEIRO/FALSO ===
            
            const useBigTeam = Math.random() < 0.75 && BIG_TEAMS.length > 0;
            const bigTeamFilter = useBigTeam ? `AND team_name IN (${BIG_TEAMS.map(() => '?').join(',')})` : '';
            const bigTeamParams = useBigTeam ? BIG_TEAMS : [];
            
            const baseFilter = `WHERE appearences >= ${minReqs.appearences} AND minutes >= ${minReqs.minutes} ${excludePlaceholder} ${positionFilter} ${difficultyFilter} ${bigTeamFilter}`;
            
            const helpField = F3_HELP_MAP[stat].type;
            
            let [players] = await db.execute(`
                SELECT id, name, photo, team_name, team_logo, position, nationality, ${stat}, ${statColumn} as stat_value, ${helpField}
                FROM ${tableName}
                ${baseFilter}
                AND ${statColumn} IS NOT NULL
                AND ${statColumn} >= ?
                ${excludeList}
                ORDER BY RAND()
                LIMIT 1
            `, [minimum, ...bigTeamParams]);

            if (players.length === 0) {
                console.log(`[FALLBACK F3] Nenhum jogador com difficulty=${difficulty}, tentando sem filtro de dificuldade...`);
                
                const baseFilterNoDiff = `WHERE appearences >= ${minReqs.appearences} AND minutes >= ${minReqs.minutes} ${excludePlaceholder} ${positionFilter} ${bigTeamFilter}`;
                
                [players] = await db.execute(`
                    SELECT id, name, photo, team_name, team_logo, position, nationality, ${stat}, ${statColumn} as stat_value, ${helpField}
                    FROM ${tableName}
                    ${baseFilterNoDiff}
                    AND ${statColumn} IS NOT NULL
                    AND ${statColumn} >= ?
                    ${excludeList}
                    ORDER BY RAND()
                    LIMIT 1
                `, [minimum, ...bigTeamParams]);
            }

            if (players.length === 0) {
                console.error(`[ERRO F3] Sem jogadores disponíveis para stat=${stat}`);
                return res.status(404).json({ error: 'Sem jogadores disponíveis' });
            }

            const player = players[0];
            const realValue = parseFloat(player.stat_value);
            
            let threshold;
            
            if (stat === 'rating') {
                const variance = (Math.random() * 0.8) - 0.4;
                threshold = parseFloat((realValue + variance).toFixed(2));
            } else if (stat === 'height') {
                const variance = Math.floor(Math.random() * 15) - 7;
                threshold = Math.round(realValue + variance);
            } else if (stat === 'age') {
                const variance = Math.floor(Math.random() * 9) - 4;
                threshold = Math.round(realValue + variance);
            } else {
                const variance = Math.max(1, Math.ceil(realValue * 0.4));
                const change = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
                threshold = Math.max(1, Math.round(realValue + change));
            }
            
            const correctAnswer = realValue >= threshold;
            const label = STAT_LABELS[stat];

            const helpData = {
                type: 'hint',
                hint_type: helpField,
                hint_value: player[helpField]
            };

            const displayThreshold = stat === 'rating' ? threshold.toFixed(2) : threshold;

            return res.json({
                format: 'F3',
                question_pt: `${player.name} tem ${displayThreshold} ou mais ${label.pt}?`,
                question_en: `Does ${player.name} have ${displayThreshold} or more ${label.en}?`,
                players: [{ 
                    id: player.id, 
                    name: player.name, 
                    photo: player.photo, 
                    team_logo: player.team_logo 
                }],
                stat,
                threshold: displayThreshold,
                correctAnswer,
                helpData,
                options: null
            });
        }

    } catch (error) {
        console.error('[ERRO STATS-QUIZ]', error);
        res.status(500).json({ error: 'Erro ao gerar pergunta' });
    }
});

module.exports = router;