const express = require('express');
const router = express.Router();
const controller = require('./competitions.controller');

// GET /api/competitions - Buscar todas
router.get('/', controller.getAllCompetitions);

// GET /api/competitions/:id - Buscar por ID
router.get('/:id', controller.getCompetitionById);

module.exports = router;