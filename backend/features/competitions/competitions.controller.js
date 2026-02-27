const service = require('./competitions.service');

// GET /api/competitions
exports.getAllCompetitions = async (req, res) => {
    try {
        const competitions = await service.getAllCompetitions();
        res.json(competitions);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar competições' });
    }
};

// GET /api/competitions/:id
exports.getCompetitionById = async (req, res) => {
    try {
        const competition = await service.getCompetitionById(req.params.id);
        res.json(competition);
        
    } catch (error) {
        console.error(error);
        
        if (error.message === 'Competição não encontrada') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Erro ao buscar competição' });
    }
};