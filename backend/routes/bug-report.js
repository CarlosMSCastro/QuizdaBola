const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
    try {
        const { message, page, user_agent, username } = req.body;
        
        await db.execute(
            'INSERT INTO bug_reports (message, page, user_agent, username, created_at) VALUES (?, ?, ?, ?, NOW())',
            [message, page || '/', user_agent || 'unknown', username || 'guest']
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao guardar bug report:', error);
        res.status(500).json({ error: 'Erro ao enviar report' });
    }
});

module.exports = router;