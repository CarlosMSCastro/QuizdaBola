const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { score, difficulty } = req.body;
        const user_id = req.user.id;

        if (!score || !difficulty) {
            return res.status(400).json({ error: 'Score e dificuldade são obrigatórios' });
        }

        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({ error: 'Dificuldade inválida' });
        }

        // verificar se já existe score melhor
        const [existing] = await db.execute(
            'SELECT score FROM scores WHERE user_id = ? AND difficulty = ? ORDER BY score DESC LIMIT 1',
            [user_id, difficulty]
        );

        if (existing.length > 0 && existing[0].score >= score) {
            return res.json({ saved: false, isNewRecord: false });
        }

        // inserir só se for novo record
        await db.execute(
            'INSERT INTO scores (user_id, score, difficulty) VALUES (?, ?, ?)',
            [user_id, score, difficulty]
        );

        res.status(201).json({ saved: true, isNewRecord: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao guardar pontuação' });
    }
});

router.get('/', async (req, res) => {
    try {
        const { difficulty } = req.query;

        let query = `
            SELECT 
                users.username,
                scores.score,
                scores.difficulty,
                scores.created_at
            FROM scores
            JOIN users ON scores.user_id = users.id
        `;

        const params = [];

        if (difficulty) {
            const validDifficulties = ['easy', 'medium', 'hard'];
            if (!validDifficulties.includes(difficulty)) {
                return res.status(400).json({ error: 'Dificuldade inválida' });
            }
            query += ' WHERE scores.difficulty = ?';
            params.push(difficulty);
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