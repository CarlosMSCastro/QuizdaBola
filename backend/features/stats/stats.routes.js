const express = require('express');
const router = express.Router();
const statsController = require('./stats.controller');
const { protect } = require('../../shared/middleware/auth');

router.get('/', protect, statsController.getStats);

module.exports = router;