const express = require('express');
const router = express.Router();
const controller = require('./stats-quiz.controller');

// GET /api/stats-quiz
router.get('/', controller.getStatsQuestion);

module.exports = router;