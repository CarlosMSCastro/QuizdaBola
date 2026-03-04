const db = require('../../shared/config/db');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers] = await db.execute('SELECT COUNT(*) as total FROM users');
    
    const [totalGames] = await db.execute('SELECT COUNT(*) as total FROM scores');
    
    const [gamesToday] = await db.execute(
      'SELECT COUNT(*) as total FROM scores WHERE DATE(created_at) = CURDATE()'
    );
    
    const [avgScore] = await db.execute('SELECT AVG(score) as avg FROM scores');
    
    const [gamesByMode] = await db.execute(`
      SELECT game_mode, COUNT(*) as total
      FROM scores
      GROUP BY game_mode
    `);
    
    const [recentUsers] = await db.execute(`
      SELECT COUNT(DISTINCT user_id) as total
      FROM scores
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Lista de todos os users
    const [allUsers] = await db.execute(`
      SELECT id, username, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    // Bug reports
    const [bugReports] = await db.execute(`
      SELECT * 
      FROM bug_reports 
      ORDER BY created_at DESC
      LIMIT 100
    `);

    res.json({
      totalUsers: totalUsers[0].total,
      totalGames: totalGames[0].total,
      gamesToday: gamesToday[0].total,
      avgScore: avgScore[0].avg ? Math.round(avgScore[0].avg) : 0,
      gamesByMode,
      activeUsers7d: recentUsers[0].total,
      allUsers,      
      bugReports     
    });
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};