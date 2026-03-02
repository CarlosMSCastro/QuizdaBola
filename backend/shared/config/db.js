const mysql = require('mysql2/promise');

const isProduction = process.env.NODE_ENV === 'production';

const dbConfig = isProduction 
  ? {
      // PRODUÇÃO - Filess.io MySQL (TODAS as credenciais vêm de ENV)
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 3,
      queueLimit: 0,
      connectTimeout: 10000,
      enableKeepAlive: true, 
      keepAliveInitialDelay: 0,
      acquireTimeout: 10000
    }
  : {
      // LOCAL - XAMPP MySQL
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'football_quiz',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

const pool = mysql.createPool(dbConfig);

// Testar conexão
pool.getConnection()
  .then(connection => {
    console.log(`✅ MySQL Connected: ${isProduction ? 'PRODUCTION (Filess.io)' : 'LOCAL (XAMPP)'}`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
  });

module.exports = pool;