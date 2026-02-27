const service = require('./bug-report.service');

// POST /api/bug-report
exports.createBugReport = async (req, res) => {
    try {
        const result = await service.saveBugReport(req.body);
        res.json(result);
        
    } catch (error) {
        console.error('Erro ao guardar bug report:', error);
        res.status(500).json({ error: 'Erro ao enviar report' });
    }
};