const express = require('express');
const router = express.Router();
const controller = require('./bug-report.controller');

// POST /api/bug-report
router.post('/', controller.createBugReport);

module.exports = router;