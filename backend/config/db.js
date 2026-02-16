const mysql = require('mysql2'); //  ligar ao MySQL
require('dotenv').config(); // carrega as variáveis do ficheiro .env

// cria um pool de ligações
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool.promise(); // exporta o pool com suporte a async/await