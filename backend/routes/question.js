const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/question?difficulty=easy&exclude=1,2,3
router.get('/', async (req, res) => {
    try {
        const { difficulty, exclude } = req.query;

        // validar dificuldade
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({ error: 'Dificuldade inválida' });
        }

        // preparar exclusão de IDs
        const excludeIds = exclude ? exclude.split(',').map(id => parseInt(id)) : [];
        
        let query = 'SELECT * FROM players WHERE difficulty = ?';
        const params = [difficulty];

        if (excludeIds.length > 0) {
            const placeholders = excludeIds.map(() => '?').join(',');
            query += ` AND id NOT IN (${placeholders})`;
            params.push(...excludeIds);
        }

        query += ' ORDER BY RAND() LIMIT 1';

        // buscar jogador aleatório
        const [players] = await db.execute(query, params);

        if (players.length === 0) {
            return res.status(404).json({ error: 'Nenhum jogador encontrado' });
        }

        const correctPlayer = players[0];

        // buscar 3 opções erradas (também excluindo IDs já usados)
        let wrongQuery = 'SELECT name FROM players WHERE id != ? AND difficulty = ?';
        const wrongParams = [correctPlayer.id, difficulty];

        if (excludeIds.length > 0) {
            const placeholders = excludeIds.map(() => '?').join(',');
            wrongQuery += ` AND id NOT IN (${placeholders})`;
            wrongParams.push(...excludeIds);
        }

        wrongQuery += ' ORDER BY RAND() LIMIT 3';

        const [wrongPlayers] = await db.execute(wrongQuery, wrongParams);

        // baralhar opções
        const options = [
            correctPlayer.name,
            ...wrongPlayers.map(p => p.name)
        ].sort(() => Math.random() - 0.5);

        res.json({
            id: correctPlayer.id,
            photo: correctPlayer.photo,
            nationality: correctPlayer.nationality,
            team_logo: correctPlayer.team_logo,
            correctAnswer: correctPlayer.name,
            options
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar pergunta' });
    }
});

module.exports = router;