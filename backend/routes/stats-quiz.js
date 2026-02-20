const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Stats disponíveis por categoria
const STATS_CONFIG = {
    attacking: {
        stats: ['goals_total', 'goals_assists', 'shots_total', 'shots_on', 'dribbles_success', 'penalty_scored'],
        minimums: { goals_total: 3, goals_assists: 2, shots_total: 5, shots_on: 3, dribbles_success: 3, penalty_scored: 1 },
        positions: ['Attacker', 'Midfielder']
    },
    midfield: {
        stats: ['passes_total', 'passes_key', 'passes_accuracy', 'duels_won'],
        minimums: { passes_total: 100, passes_key: 5, passes_accuracy: 50, duels_won: 20 },
        positions: ['Midfielder']
    },
    defensive: {
        stats: ['tackles_total', 'tackles_interceptions', 'tackles_blocks', 'duels_won'],
        minimums: { tackles_total: 10, tackles_interceptions: 5, tackles_blocks: 3, duels_won: 20 },
        positions: ['Defender', 'Midfielder']
    },
    goalkeeper: {
        stats: ['goals_saves', 'goals_conceded'],
        minimums: { goals_saves: 5, goals_conceded: 1 },
        positions: ['Goalkeeper']
    },
    universal: {
        stats: ['rating', 'minutes', 'appearences', 'cards_yellow'],
        minimums: { rating: 6.0, minutes: 300, appearences: 5, cards_yellow: 1 },
        positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker']
    }
};

const STAT_LABELS = {
    goals_total: { pt: 'golos', en: 'goals' },
    goals_assists: { pt: 'assistências', en: 'assists' },
    shots_total: { pt: 'remates', en: 'shots' },
    shots_on: { pt: 'remates enquadrados', en: 'shots on target' },
    dribbles_success: { pt: 'dribles bem sucedidos', en: 'successful dribbles' },
    penalty_scored: { pt: 'penáltis marcados', en: 'penalties scored' },
    passes_total: { pt: 'passes', en: 'passes' },
    passes_key: { pt: 'passes decisivos', en: 'key passes' },
    passes_accuracy: { pt: '% precisão de passes', en: 'pass accuracy %' },
    tackles_total: { pt: 'tackles', en: 'tackles' },
    tackles_interceptions: { pt: 'interceções', en: 'interceptions' },
    tackles_blocks: { pt: 'bloqueios', en: 'blocks' },
    duels_won: { pt: 'duelos ganhos', en: 'duels won' },
    goals_saves: { pt: 'defesas', en: 'saves' },
    goals_conceded: { pt: 'golos sofridos', en: 'goals conceded' },
    rating: { pt: 'rating', en: 'rating' },
    minutes: { pt: 'minutos jogados', en: 'minutes played' },
    appearences: { pt: 'jogos', en: 'appearances' },
    cards_yellow: { pt: 'cartões amarelos', en: 'yellow cards' }
};

// Escolher stat e categoria aleatórias
const randomStat = () => {
    const categories = Object.keys(STATS_CONFIG);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const config = STATS_CONFIG[category];
    const stat = config.stats[Math.floor(Math.random() * config.stats.length)];
    return { stat, category, config };
};

// Gerar opções plausíveis para F1
const generateF1Options = (correctValue, stat) => {
    const options = new Set([correctValue]);
    const isDecimal = stat === 'rating';
    const range = Math.max(Math.ceil(correctValue * 0.4), 2);

    let attempts = 0;
    while (options.size < 4 && attempts < 100) {
        attempts++;
        const delta = Math.floor(Math.random() * range * 2) - range;
        let val = correctValue + delta;
        if (val <= 0) val = 1;
        if (isDecimal) {
            val = parseFloat((correctValue + (Math.random() * 0.8 - 0.4)).toFixed(2));
            if (val <= 5.0) val = 5.5;
        }
        if (val !== correctValue) options.add(val);
    }

    return [...options].sort(() => Math.random() - 0.5);
};

// GET /api/stats-quiz?exclude=1,2,3&competition_id=ligaportugal2024
router.get('/', async (req, res) => {
    try {
        const { exclude, competition_id } = req.query;

        // validar e buscar competição
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

        const formats = ['F1', 'F2', 'F3'];
        const format = formats[Math.floor(Math.random() * formats.length)];

        const { stat, category, config } = randomStat();
        const minimum = config.minimums[stat];
        const positions = config.positions;

        const excludePlaceholder = `AND is_photo_placeholder = 0`;
        const excludeList = excludeIds.length > 0 ? `AND id NOT IN (${excludeIds.join(',')})` : '';
        const positionFilter = `AND position IN (${positions.map(p => `'${p}'`).join(',')})`;
        const baseFilter = `WHERE appearences >= 5 AND minutes >= 300 ${excludePlaceholder} ${positionFilter}`;

        if (format === 'F1') {
            // 1 jogador, adivinhar valor
            const [players] = await db.execute(`
                SELECT id, name, photo, team_logo, position, ${stat}
                FROM ${tableName}
                ${baseFilter}
                AND ${stat} >= ?
                ${excludeList}
                ORDER BY RAND() LIMIT 1
            `, [minimum]);

            if (players.length === 0) return res.status(404).json({ error: 'Sem jogadores disponíveis' });

            const player = players[0];
            const correctValue = stat === 'rating'
                ? parseFloat(parseFloat(player[stat]).toFixed(2))
                : player[stat];

            const options = generateF1Options(correctValue, stat);
            const label = STAT_LABELS[stat];

            return res.json({
                format: 'F1',
                question_pt: `Quantos ${label.pt} teve ${player.name} esta época?`,
                question_en: `How many ${label.en} did ${player.name} have this season?`,
                players: [{ id: player.id, name: player.name, photo: player.photo, team_logo: player.team_logo }],
                stat,
                correctAnswer: correctValue,
                options
            });

        } else if (format === 'F2') {
            // 2 jogadores, comparar
            const [pool] = await db.execute(`
                SELECT id, name, photo, team_logo, position, ${stat}
                FROM ${tableName}
                ${baseFilter}
                AND ${stat} >= ?
                ${excludeList}
                ORDER BY RAND() LIMIT 20
            `, [minimum]);

            if (pool.length < 2) return res.status(404).json({ error: 'Sem jogadores disponíveis' });

            // encontrar par plausível (diferença <= 50% do maior)
            let player1 = null, player2 = null;
            outer: for (let i = 0; i < pool.length; i++) {
                for (let j = i + 1; j < pool.length; j++) {
                    const a = parseFloat(pool[i][stat]);
                    const b = parseFloat(pool[j][stat]);
                    if (a === b) continue;
                    const max = Math.max(a, b);
                    const diff = Math.abs(a - b);
                    if (diff / max <= 0.5) {
                        player1 = pool[i];
                        player2 = pool[j];
                        break outer;
                    }
                }
            }

            if (!player1 || !player2) return res.status(404).json({ error: 'Sem par plausível disponível' });

            const label = STAT_LABELS[stat];
            const correctId = parseFloat(player1[stat]) > parseFloat(player2[stat]) ? player1.id : player2.id;

            return res.json({
                format: 'F2',
                question_pt: `Quem teve mais ${label.pt}?`,
                question_en: `Who had more ${label.en}?`,
                players: [
                    { id: player1.id, name: player1.name, photo: player1.photo, team_logo: player1.team_logo, statValue: player1[stat] },
                    { id: player2.id, name: player2.name, photo: player2.photo, team_logo: player2.team_logo, statValue: player2[stat] }
                ],
                stat,
                correctAnswer: correctId,
                options: null
            });

        } else {
            // F3 — True/False
            const [players] = await db.execute(`
                SELECT id, name, photo, team_logo, position, ${stat}
                FROM ${tableName}
                ${baseFilter}
                AND ${stat} >= ?
                ${excludeList}
                ORDER BY RAND() LIMIT 1
            `, [minimum]);

            if (players.length === 0) return res.status(404).json({ error: 'Sem jogadores disponíveis' });

            const player = players[0];
            const realValue = parseFloat(player[stat]);
            const threshold = Math.round(realValue * (Math.random() > 0.5 ? 0.75 : 1.25));
            const correctAnswer = realValue >= threshold;
            const label = STAT_LABELS[stat];

            return res.json({
                format: 'F3',
                question_pt: `${player.name} teve ${threshold} ou mais ${label.pt} esta época?`,
                question_en: `Did ${player.name} have ${threshold} or more ${label.en} this season?`,
                players: [{ id: player.id, name: player.name, photo: player.photo, team_logo: player.team_logo }],
                stat,
                correctAnswer,
                options: ['Sim', 'Não']
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao gerar pergunta' });
    }
});

module.exports = router;