const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/competitions - Buscar TODAS as competições (ativas e inativas)
router.get('/', async (req, res) => {
    try {
        const [competitions] = await db.execute(
            'SELECT id, name, logo, season, country, active FROM competitions ORDER BY active DESC, created_at DESC'
        );
        res.json(competitions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar competições' });
    }
});

// GET /api/competitions/:id - Buscar competição específica (incluindo table_name para uso interno)
router.get('/:id', async (req, res) => {
    try {
        const [competitions] = await db.execute(
            'SELECT * FROM competitions WHERE id = ?',
            [req.params.id]
        );
        
        if (competitions.length === 0) {
            return res.status(404).json({ error: 'Competição não encontrada' });
        }
        
        res.json(competitions[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar competição' });
    }
});

module.exports = router;