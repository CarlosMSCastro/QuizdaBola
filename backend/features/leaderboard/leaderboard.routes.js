const express = require('express');
const router = express.Router();
const controller = require('./leaderboard.controller');
const { authenticateToken } = require('../../shared/middleware/auth.middleware');

// POST /api/leaderboard - Guardar score
router.post('/', authenticateToken, controller.saveScore);

// GET /api/leaderboard - Buscar leaderboard
router.get('/', controller.getLeaderboard);

module.exports = router;