const db = require('../../shared/config/db');

// Validar dados do score
exports.validateScoreData = (data) => {
    const { score, game_mode } = data;
    
    if (!score || !game_mode) {
        throw new Error('Score e game_mode são obrigatórios');
    }

    const validModes = ['classic', 'stats'];
    if (!validModes.includes(game_mode)) {
        throw new Error('Modo inválido');
    }
};

// Salvar score
exports.saveScore = async (data, userId) => {
    const { score, game_mode, competition_id } = data;
    const compId = competition_id || 'ligaportugal2024';

    // Verificar record existente
    const [existing] = await db.execute(
        'SELECT score FROM scores WHERE user_id = ? AND game_mode = ? AND competition_id = ? ORDER BY score DESC LIMIT 1',
        [userId, game_mode, compId]
    );

    if (existing.length > 0 && existing[0].score >= score) {
        return { saved: false, isNewRecord: false };
    }

    // Guardar score
    await db.execute(
        'INSERT INTO scores (user_id, score, game_mode, competition_id) VALUES (?, ?, ?, ?)',
        [userId, score, game_mode, compId]
    );

    return { saved: true, isNewRecord: true };
};

// Buscar leaderboard
exports.getLeaderboard = async (query) => {
    const { game_mode, competition_id } = query;

    let sql = `
        SELECT users.username, scores.score, scores.game_mode, scores.competition_id, scores.created_at
        FROM scores
        JOIN users ON scores.user_id = users.id
        WHERE 1=1
    `;
    const params = [];

    if (game_mode) {
        sql += ' AND scores.game_mode = ?';
        params.push(game_mode);
    }

    if (competition_id) {
        sql += ' AND scores.competition_id = ?';
        params.push(competition_id);
    }

    sql += ' ORDER BY scores.score DESC, scores.created_at ASC LIMIT 100';

    const [scores] = await db.execute(sql, params);
    return scores;
};