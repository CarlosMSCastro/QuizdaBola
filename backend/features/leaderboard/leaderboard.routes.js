const express = require('express');
const router = express.Router();
const controller = require('./leaderboard.controller');
const { protect } = require('../../shared/middleware/auth');

// POST /api/leaderboard - Guardar score
router.post('/', protect, controller.saveScore);

// GET /api/leaderboard - Buscar leaderboard
router.get('/', controller.getLeaderboard);

module.exports = router;