const express = require('express');
const router = express.Router();
const controller = require('./question.controller');

// GET /api/question
router.get('/', controller.getQuestion);

module.exports = router;