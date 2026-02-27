const service = require('./leaderboard.service');

// POST /api/leaderboard
exports.saveScore = async (req, res) => {
    try {
        // Validar dados
        service.validateScoreData(req.body);
        
        // Salvar score
        const result = await service.saveScore(req.body, req.user.id);
        
        if (result.isNewRecord) {
            return res.status(201).json(result);
        }
        
        res.json(result);

    } catch (error) {
        console.error(error);
        
        if (error.message.includes('obrigatórios') || error.message.includes('inválido')) {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Erro ao guardar pontuação' });
    }
};

// GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const scores = await service.getLeaderboard(req.query);
        res.json(scores);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar leaderboard' });
    }
};