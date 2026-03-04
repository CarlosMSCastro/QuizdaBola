const service = require('./question.service');

// GET /api/question?exclude=1,2,3&competition_id=ligaportugal2024
exports.getQuestion = async (req, res) => {
    try {
        const { exclude, competition_id } = req.query;
        
        // Validar e Procurar competição
        const competitionId = competition_id || 'ligaportugal2024';
        const tableName = await service.getActiveCompetition(competitionId);
        
        // Escolher dificuldade
        const difficulty = service.determineDifficulty();
        
        // Preparar exclusão de IDs
        const excludeIds = exclude ? exclude.split(',').map(id => parseInt(id)) : [];
        
        // Procurar jogador aleatório
        const correctPlayer = await service.getRandomPlayer(tableName, difficulty, excludeIds);
        
        // Procurar e escolher 3 opções erradas
        const wrongOptions = await service.getWrongOptions(
            tableName, 
            correctPlayer.id, 
            difficulty, 
            excludeIds
        );
        
        // Baralhar opções
        const options = service.shuffleOptions(correctPlayer.name, wrongOptions);
        
        res.json({
            id: correctPlayer.id,
            photo: correctPlayer.photo,
            nationality: correctPlayer.nationality,
            team_logo: correctPlayer.team_logo,
            correctAnswer: correctPlayer.name,
            options,
            difficulty
        });
        
    } catch (error) {
        console.error(error);
        
        if (error.message === 'Competição não encontrada') {
            return res.status(404).json({ error: error.message });
        }
        
        if (error.message === 'Nenhum jogador encontrado') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Erro ao buscar pergunta' });
    }
};