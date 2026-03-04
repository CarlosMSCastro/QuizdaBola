const db = require('../../shared/config/db');

// Configurações
const BIG_TEAMS_BY_COMPETITION = {
    'ligaportugal2024': ['Benfica', 'FC Porto', 'Sporting CP', 'Braga', 'Vitória SC'],
    'brasileirao2024': ['Flamengo', 'Palmeiras', 'Corinthians', 'Sao Paulo', 'Atletico-MG']
};

const MIN_REQUIREMENTS = {
    'ligaportugal2024': { appearences: 5, minutes: 300 },
    'brasileirao2024': { appearences: 3, minutes: 150 }
};

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
        pt: 'altura', en: 'height', unit: 'cm',
        question_pt: 'Quem é mais alto?',
        question_en: 'Who is taller?'
    },
    age: { 
        pt: 'anos', en: 'years old', unit: '',
        question_pt: 'Quem é mais velho?',
        question_en: 'Who is older?'
    },
    goals_total: { 
        pt: 'golos', en: 'goals', unit: '',
        question_pt: 'Quem marcou mais golos?',
        question_en: 'Who scored more goals?'
    },
    goals_assists: { 
        pt: 'assistências', en: 'assists', unit: '',
        question_pt: 'Quem fez mais assistências?',
        question_en: 'Who made more assists?'
    },
    rating: { 
        pt: 'rating', en: 'rating', unit: '',
        question_pt: 'Quem tem melhor rating?',
        question_en: 'Who has a better rating?'
    },
    cards_yellow: { 
        pt: 'cartões amarelos', en: 'yellow cards', unit: '',
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

// Funções auxiliares
exports.getActiveCompetition = async (competitionId) => {
    const [competitions] = await db.execute(
        'SELECT table_name FROM competitions WHERE id = ? AND active = 1',
        [competitionId]
    );

    if (competitions.length === 0) {
        throw new Error('Competição não encontrada');
    }

    return competitions[0].table_name;
};

exports.getBigTeams = (competitionId) => {
    return BIG_TEAMS_BY_COMPETITION[competitionId] || [];
};

exports.getMinRequirements = (competitionId) => {
    return MIN_REQUIREMENTS[competitionId] || { appearences: 5, minutes: 300 };
};

exports.determineFormat = () => {
    return Math.random() * 100 < 80 ? 'F2' : 'F3';
};

exports.determineDifficulty = () => {
    const rand = Math.random() * 100;
    if (rand < 40) return 'easy';
    if (rand < 75) return 'medium';
    return 'hard';
};

exports.randomStat = () => {
    const categories = Object.keys(STATS_CONFIG);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const config = STATS_CONFIG[category];
    const stat = config.stats[Math.floor(Math.random() * config.stats.length)];
    return { stat, category, config };
};

exports.getStatLabels = () => STAT_LABELS;
exports.getF3HelpMap = () => F3_HELP_MAP;

// Funções "F2" (tipo de pergunta que apresenta 2 jogadores)
exports.getF2PlayerPool = async (tableName, stat, statColumn, minimum, positions, difficulty, excludeList, bigTeamsOrder, BIG_TEAMS, minReqs) => {
    const positionFilter = `AND position IN (${positions.map(p => `'${p}'`).join(',')})`;
    const difficultyFilter = `AND difficulty = '${difficulty}'`;
    const baseFilter = `WHERE appearences >= ${minReqs.appearences} AND minutes >= ${minReqs.minutes} AND is_photo_placeholder = 0 ${positionFilter} ${difficultyFilter}`;
    
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
        
        const baseFilterNoDiff = `WHERE appearences >= ${minReqs.appearences} AND minutes >= ${minReqs.minutes} AND is_photo_placeholder = 0 ${positionFilter}`;
        
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

    return pool;
};

exports.findPlausiblePair = (pool, stat) => {
    for (let i = 0; i < pool.length; i++) {
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
                return { player1: pool[i], player2: pool[j] };
            }
        }
    }
    return null;
};

exports.fallbackToAge = async (tableName, excludeList, bigTeamsOrder, BIG_TEAMS, minReqs) => {
    const agePositions = STATS_CONFIG.physical.positions;
    const agePositionFilter = `AND position IN (${agePositions.map(p => `'${p}'`).join(',')})`;
    
    const [pool] = await db.execute(`
        SELECT id, name, photo, team_name, team_logo, position, age, age as stat_value
        FROM ${tableName}
        WHERE appearences >= ${minReqs.appearences} 
        AND minutes >= ${minReqs.minutes} 
        AND is_photo_placeholder = 0
        ${agePositionFilter}
        AND age IS NOT NULL
        ${excludeList}
        ORDER BY ${bigTeamsOrder}, RAND()
        LIMIT 50
    `, BIG_TEAMS.length > 0 ? BIG_TEAMS : []);
    
    for (let i = 0; i < pool.length; i++) {
        for (let j = i + 1; j < pool.length; j++) {
            const a = parseFloat(pool[i].stat_value);
            const b = parseFloat(pool[j].stat_value);
            
            if (a === b) continue;
            const diff = Math.abs(a - b);
            
            if (diff <= 15 && diff >= 1) {
                return { player1: pool[i], player2: pool[j], stat: 'age' };
            }
        }
    }
    return null;
};

exports.formatStatValue = (stat, val) => {
    const label = STAT_LABELS[stat];
    const numVal = parseFloat(val);
    if (stat === 'height') return `${numVal}${label.unit}`;
    if (stat === 'rating') return numVal.toFixed(2);
    return Math.round(numVal);
};

// Funções "F3" (tipo de pergunta que apresenta 1 jogador e 2 respostas)
exports.getF3Player = async (tableName, stat, statColumn, minimum, positions, difficulty, excludeList, bigTeamFilter, bigTeamParams, minReqs, helpField) => {
    const positionFilter = `AND position IN (${positions.map(p => `'${p}'`).join(',')})`;
    const difficultyFilter = `AND difficulty = '${difficulty}'`;
    const baseFilter = `WHERE appearences >= ${minReqs.appearences} AND minutes >= ${minReqs.minutes} AND is_photo_placeholder = 0 ${positionFilter} ${difficultyFilter} ${bigTeamFilter}`;
    
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
        
        const baseFilterNoDiff = `WHERE appearences >= ${minReqs.appearences} AND minutes >= ${minReqs.minutes} AND is_photo_placeholder = 0 ${positionFilter} ${bigTeamFilter}`;
        
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

    return players.length > 0 ? players[0] : null;
};

exports.calculateF3Threshold = (stat, realValue) => {
    if (stat === 'rating') {
        const variance = (Math.random() * 0.8) - 0.4;
        return parseFloat((realValue + variance).toFixed(2));
    } else if (stat === 'height') {
        const variance = Math.floor(Math.random() * 15) - 7;
        return Math.round(realValue + variance);
    } else if (stat === 'age') {
        const variance = Math.floor(Math.random() * 9) - 4;
        return Math.round(realValue + variance);
    } else {
        const variance = Math.max(1, Math.ceil(realValue * 0.4));
        const change = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
        return Math.max(1, Math.round(realValue + change));
    }
};