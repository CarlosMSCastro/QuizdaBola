const mysql = require('mysql2/promise');

const isProduction = process.env.NODE_ENV === 'production';

const dbConfig = isProduction 
  ? {
      // PRODUÇÃO - Filess.io MySQL
      host: process.env.DB_HOST || 'd7dq4k.h.filess.io',
      port: process.env.DB_PORT || 61001,
      user: process.env.DB_USER || 'football_quiz_missingtip',
      password: process.env.DB_PASSWORD || '5555456f6ffe759fc97ff34222fe3229439a36ff',
      database: process.env.DB_NAME || 'football_quiz_missingtip',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
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