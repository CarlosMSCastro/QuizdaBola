const express = require('express'); // framework do servidor
const cors = require('cors');       // permite pedidos do frontend React
require('dotenv').config();         // carrega o .env

const app = express();

app.use(cors());          // ativa o CORS
app.use(express.json());  // permite receber JSON nos pedidos

// rotas
app.use('/api/question', require('./routes/question'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// inicia o servidor na porta definida no .env (ou 3000 por defeito)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});