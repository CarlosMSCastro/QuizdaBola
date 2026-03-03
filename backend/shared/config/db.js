require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

const isProduction = process.env.NODE_ENV === 'production';

const dbConfig = isProduction 
  ? {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 3,
      queueLimit: 15,
      connectTimeout: 10000,
      enableKeepAlive: true, 
      keepAliveInitialDelay: 0,
      idleTimeout: 20000,
      maxIdle: 1,
      acquireTimeout: 15000
    }
  : {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'football_quiz',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

const pool = mysql.createPool(dbConfig);

pool.getConnection()
  .then(connection => {
    console.log(`✅ MySQL Connected: ${isProduction ? 'PRODUCTION (Filess.io)' : 'LOCAL (XAMPP)'}`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
  });

module.exports = pool;