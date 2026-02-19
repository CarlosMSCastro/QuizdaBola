const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/question', require('./routes/question'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/stats-quiz', require('./routes/stats-quiz'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});