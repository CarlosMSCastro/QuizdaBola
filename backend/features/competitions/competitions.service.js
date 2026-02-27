const db = require('../../shared/config/db');

// Buscar todas as competições
exports.getAllCompetitions = async () => {
    const [competitions] = await db.execute(`
        SELECT id, name, logo, season, country, active 
        FROM competitions 
        ORDER BY 
            active DESC,
            CASE 
                WHEN id = 'ligaportugal2024' THEN 1 
                ELSE 2 
            END,
            name ASC
    `);
    
    return competitions;
};

// Buscar competição por ID
exports.getCompetitionById = async (id) => {
    const [competitions] = await db.execute(
        'SELECT * FROM competitions WHERE id = ?',
        [id]
    );
    
    if (competitions.length === 0) {
        throw new Error('Competição não encontrada');
    }
    
    return competitions[0];
};