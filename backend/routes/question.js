const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/question?difficulty=easy&exclude=1,2,3&competition_id=ligaportugal2024
router.get('/', async (req, res) => {
    try {
        const { difficulty, exclude, competition_id } = req.query;

        // validar dificuldade
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({ error: 'Dificuldade inválida' });
        }

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

        // preparar exclusão de IDs
        const excludeIds = exclude ? exclude.split(',').map(id => parseInt(id)) : [];
        
        let query = `SELECT * FROM ${tableName} WHERE difficulty = ? AND is_photo_placeholder = 0`;
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

        // buscar 3 opções erradas
        let wrongQuery = `SELECT name FROM ${tableName} WHERE id != ? AND difficulty = ? AND is_photo_placeholder = 0`;
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