const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configurado ANTES de todas as rotas
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://quizdabola.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/question', require('./features/quiz/question.routes'));
app.use('/api/auth', require('./features/auth/auth.routes'));
app.use('/api/leaderboard', require('./features/leaderboard/leaderboard.routes'));
app.use('/api/stats-quiz', require('./features/stats-quiz/stats-quiz.routes'));
app.use('/api/competitions', require('./features/competitions/competitions.routes'));
app.use('/api/bug-report', require('./features/bug-report/bug-report.routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor a correr na porta ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});