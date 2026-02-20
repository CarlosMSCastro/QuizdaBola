const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.user = user;
        next();
    });
};

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { score, game_mode, difficulty, competition_id } = req.body;
        const user_id = req.user.id;

        if (!score || !game_mode) {
            return res.status(400).json({ error: 'Score e game_mode são obrigatórios' });
        }

        const validModes = ['classic', 'stats'];
        if (!validModes.includes(game_mode)) {
            return res.status(400).json({ error: 'Modo inválido' });
        }

        if (game_mode === 'classic') {
            const validDifficulties = ['easy', 'medium', 'hard'];
            if (!difficulty || !validDifficulties.includes(difficulty)) {
                return res.status(400).json({ error: 'Dificuldade inválida' });
            }
        }

        const compId = competition_id || 'ligaportugal2024';

        // verificar record existente
        let existingQuery, existingParams;
        if (game_mode === 'classic') {
            existingQuery = 'SELECT score FROM scores WHERE user_id = ? AND game_mode = ? AND difficulty = ? AND competition_id = ? ORDER BY score DESC LIMIT 1';
            existingParams = [user_id, game_mode, difficulty, compId];
        } else {
            existingQuery = 'SELECT score FROM scores WHERE user_id = ? AND game_mode = ? AND competition_id = ? ORDER BY score DESC LIMIT 1';
            existingParams = [user_id, game_mode, compId];
        }

        const [existing] = await db.execute(existingQuery, existingParams);
        if (existing.length > 0 && existing[0].score >= score) {
            return res.json({ saved: false, isNewRecord: false });
        }

        await db.execute(
            'INSERT INTO scores (user_id, score, game_mode, competition_id, difficulty) VALUES (?, ?, ?, ?, ?)',
            [user_id, score, game_mode, compId, difficulty || null]
        );

        res.status(201).json({ saved: true, isNewRecord: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao guardar pontuação' });
    }
});

router.get('/', async (req, res) => {
    try {
        const { game_mode, difficulty, competition_id } = req.query;

        let query = `
            SELECT users.username, scores.score, scores.game_mode, scores.difficulty, scores.competition_id, scores.created_at
            FROM scores
            JOIN users ON scores.user_id = users.id
            WHERE 1=1
        `;
        const params = [];

        if (game_mode) {
            query += ' AND scores.game_mode = ?';
            params.push(game_mode);
        }

        if (difficulty && game_mode === 'classic') {
            query += ' AND scores.difficulty = ?';
            params.push(difficulty);
        }

        if (competition_id) {
            query += ' AND scores.competition_id = ?';
            params.push(competition_id);
        }

        query += ' ORDER BY scores.score DESC, scores.created_at ASC LIMIT 100';

        const [scores] = await db.execute(query, params);
        res.json(scores);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar leaderboard' });
    }
});

module.exports = router;