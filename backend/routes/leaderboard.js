const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // formato: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user; // adiciona info do user ao request
        next();
    });
};

// POST /api/leaderboard - guardar pontuação (requer autenticação)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { score, difficulty } = req.body;
        const user_id = req.user.id;

        // validar inputs
        if (!score || !difficulty) {
            return res.status(400).json({ error: 'Score e dificuldade são obrigatórios' });
        }

        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({ error: 'Dificuldade inválida' });
        }

        // inserir pontuação na BD
        await db.execute(
            'INSERT INTO scores (user_id, score, difficulty) VALUES (?, ?, ?)',
            [user_id, score, difficulty]
        );

        res.status(201).json({ message: 'Pontuação guardada com sucesso' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao guardar pontuação' });
    }
});

// GET /api/leaderboard?difficulty=easy - ver top pontuações
router.get('/', async (req, res) => {
    try {
        const { difficulty } = req.query;

        // se não especificar dificuldade, mostra todas
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