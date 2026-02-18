const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/question?difficulty=easy
router.get('/', async (req, res) => {
    try {
        const { difficulty } = req.query; // lê o parâmetro ?difficulty=easy

        // validar dificuldade
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({ error: 'Dificuldade inválida' });
        }

        // buscar jogador aleatório da dificuldade escolhida
        const [players] = await db.execute(
            'SELECT * FROM players WHERE difficulty = ? ORDER BY RAND() LIMIT 1',
            [difficulty]
        );

        if (players.length === 0) {
            return res.status(404).json({ error: 'Nenhum jogador encontrado' });
        }

        const correctPlayer = players[0];

        // buscar 3 jogadores aleatórios diferentes para as opções erradas
        const [wrongPlayers] = await db.execute(
            'SELECT name FROM players WHERE id != ? AND difficulty = ? ORDER BY RAND() LIMIT 3',
            [correctPlayer.id, difficulty]
        );

        // criar array de opções e baralhar
        const options = [
            correctPlayer.name,
            ...wrongPlayers.map(p => p.name)
        ].sort(() => Math.random() - 0.5);

        res.json({
            photo: correctPlayer.photo,
            correctAnswer: correctPlayer.name,
            options
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro' });
    }
});

module.exports = router;