const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Big 5 teams (prioridade)
const BIG_TEAMS = ['Benfica', 'FC Porto', 'Sporting CP', 'Braga', 'Vitória SC'];

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

// Mapa de ajudas contextuais para F3
const F3_HELP_MAP = {
    age: { type: 'position' },
    height: { type: 'position' },
    goals_total: { type: 'position' },
    goals_assists: { type: 'position' },
    rating: { type: 'team_name' },
    cards_yellow: { type: 'position' }
};

// Escolher stat aleatória
const randomStat = () => {
    const categories = Object.keys(STATS_CONFIG);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const config = STATS_CONFIG[category];
    const stat = config.stats[Math.floor(Math.random() * config.stats.length)];
    return { stat, category, config };
};

// GET /api/stats-quiz?exclude=1,2,3&competition_id=ligaportugal2024
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

        const excludeIds = exclude
            ? exclude.split(',').map(Number).filter(Boolean)
            : [];

        // F2 (80%) vs F3 (20%)
        const formatRand = Math.random() * 100;
        const format = formatRand < 80 ? 'F2' : 'F3';

        // Distribuição de dificuldade: 40% easy, 35% medium, 25% hard
        const diffRand = Math.random() * 100;
        let difficulty;
        if (diffRand < 40) {
            difficulty = 'easy';
        } else if (diffRand < 75) {
            difficulty = 'medium';
        } else {
            difficulty = 'hard';
        }

        const { stat, config } = randomStat();
        const minimum = config.minimums[stat];
        const positions = config.positions;

        const excludePlaceholder = `AND is_photo_placeholder = 0`;
        const excludeList = excludeIds.length > 0 ? `AND id NOT IN (${excludeIds.join(',')})` : '';
        const positionFilter = `AND position IN (${positions.map(p => `'${p}'`).join(',')})`;
        const difficultyFilter = `AND difficulty = '${difficulty}'`;
        
        // Peso Big 5
        const bigTeamsOrder = `
            CASE 
                WHEN team_name IN (${BIG_TEAMS.map(() => '?').join(',')}) 
                THEN 1 
                ELSE 2 
            END
        `;

        // Stat column (handle height as VARCHAR)
        const statColumn = stat === 'height' ? 'CAST(height AS UNSIGNED)' : stat;

        if (format === 'F2') {
            // === F2: COMPARAÇÃO ===
            
            const baseFilter = `WHERE appearences >= 5 AND minutes >= 300 ${excludePlaceholder} ${positionFilter} ${difficultyFilter}`;
            
            // Query com prioridade Big 5 (pool aumentado)
            let [pool] = await db.execute(`
                SELECT id, name, photo, team_name, team_logo, position, ${stat}, ${statColumn} as stat_value
                FROM ${tableName}
                ${baseFilter}
                AND ${statColumn} >= ?
                ${excludeList}
                ORDER BY ${bigTeamsOrder}, RAND()
                LIMIT 50
            `, [minimum, ...BIG_TEAMS]);

            // Fallback sem difficulty filter
            if (pool.length < 2) {
                console.log(`[FALLBACK F2] Poucos jogadores com difficulty=${difficulty}, tentando sem filtro de dificuldade...`);
                
                const baseFilterNoDiff = `WHERE appearences >= 5 AND minutes >= 300 ${excludePlaceholder} ${positionFilter}`;
                
                [pool] = await db.execute(`
                    SELECT id, name, photo, team_name, team_logo, position, ${stat}, ${statColumn} as stat_value
                    FROM ${tableName}
                    ${baseFilterNoDiff}
                    AND ${statColumn} >= ?
                    ${excludeList}
                    ORDER BY ${bigTeamsOrder}, RAND()
                    LIMIT 50
                `, [minimum, ...BIG_TEAMS]);
            }

            if (pool.length < 2) {
                console.error(`[ERRO F2] Sem jogadores disponíveis para stat=${stat}`);
                return res.status(404).json({ error: 'Sem jogadores disponíveis' });
            }

            // Encontrar par plausível com regras ALARGADAS
            let player1 = null, player2 = null;
            outer: for (let i = 0; i < pool.length; i++) {
                for (let j = i + 1; j < pool.length; j++) {
                    const a = parseFloat(pool[i].stat_value);
                    const b = parseFloat(pool[j].stat_value);
                    
                    // CRÍTICO: Nunca valores iguais
                    if (a === b) continue;
                    
                    const max = Math.max(a, b);
                    const diff = Math.abs(a - b);
                    
                    // Regras ALARGADAS por stat
                    let isPlausible = false;
                    
                    if (stat === 'age') {
                        // Diferença entre 1 e 15 anos (muito alargado)
                        isPlausible = diff <= 15 && diff >= 1;
                    } else if (stat === 'height') {
                        // Diferença entre 2 e 25cm (muito alargado)
                        isPlausible = diff <= 25 && diff >= 2;
                    } else if (stat === 'rating') {
                        // Diferença entre 0.01 e 2.0 (muito alargado)
                        isPlausible = diff <= 2.0 && diff >= 0.01;
                    } else {
                        // Outros: diferença <= 80% do maior (muito alargado)
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
                return res.status(404).json({ error: 'Sem par plausível disponível' });
            }

            const label = STAT_LABELS[stat];
            const correctId = parseFloat(player1.stat_value) > parseFloat(player2.stat_value) ? player1.id : player2.id;

            // Formatar valores para display
            const formatValue = (val) => {
                const numVal = parseFloat(val);
                if (stat === 'height') return `${numVal}${label.unit}`;
                if (stat === 'rating') return numVal.toFixed(2);
                return Math.round(numVal);
            };

            // HelpData para F2: valores de ambos os jogadores (frontend escolhe qual revelar)
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
            
            // 75% Big 5, 25% outras
            const useBigTeam = Math.random() < 0.75;
            const bigTeamFilter = useBigTeam ? `AND team_name IN (${BIG_TEAMS.map(() => '?').join(',')})` : '';
            const bigTeamParams = useBigTeam ? BIG_TEAMS : [];
            
            const baseFilter = `WHERE appearences >= 5 AND minutes >= 300 ${excludePlaceholder} ${positionFilter} ${difficultyFilter} ${bigTeamFilter}`;
            
            // Buscar jogador + dados extras para ajudas
            const helpField = F3_HELP_MAP[stat].type;
            
            let [players] = await db.execute(`
                SELECT id, name, photo, team_name, team_logo, position, nationality, ${stat}, ${statColumn} as stat_value, ${helpField}
                FROM ${tableName}
                ${baseFilter}
                AND ${statColumn} >= ?
                ${excludeList}
                ORDER BY RAND()
                LIMIT 1
            `, [minimum, ...bigTeamParams]);

            // Fallback sem difficulty filter
            if (players.length === 0) {
                console.log(`[FALLBACK F3] Nenhum jogador com difficulty=${difficulty}, tentando sem filtro de dificuldade...`);
                
                const baseFilterNoDiff = `WHERE appearences >= 5 AND minutes >= 300 ${excludePlaceholder} ${positionFilter} ${bigTeamFilter}`;
                
                [players] = await db.execute(`
                    SELECT id, name, photo, team_name, team_logo, position, nationality, ${stat}, ${statColumn} as stat_value, ${helpField}
                    FROM ${tableName}
                    ${baseFilterNoDiff}
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
            
            // Threshold inteligente por stat
            let threshold;
            
            if (stat === 'rating') {
                // Rating: +/- 0.4 do valor real, sempre 2 casas decimais
                const variance = (Math.random() * 0.8) - 0.4;
                threshold = parseFloat((realValue + variance).toFixed(2));
            } else if (stat === 'height') {
                // Altura: +/- 7cm
                const variance = Math.floor(Math.random() * 15) - 7;
                threshold = Math.round(realValue + variance);
            } else if (stat === 'age') {
                // Idade: +/- 4 anos
                const variance = Math.floor(Math.random() * 9) - 4;
                threshold = Math.round(realValue + variance);
            } else {
                // Outros: +/- 40% do valor real (mínimo +/-1)
                const variance = Math.max(1, Math.ceil(realValue * 0.4));
                const change = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
                threshold = Math.max(1, Math.round(realValue + change));
            }
            
            const correctAnswer = realValue >= threshold;
            const label = STAT_LABELS[stat];

            // Preparar dados de ajuda (1 hint apenas)
            const helpData = {
                type: 'hint',
                hint_type: helpField,
                hint_value: player[helpField]
            };

            // Formatar threshold para display
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