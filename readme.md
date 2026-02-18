# Liga Portugal Quiz

Quiz de fotos de jogadores da Primeira Liga 2024. Aparece uma foto, escolhes o nome certo entre 4 opções.

## Stack
- **Frontend:** React + Vite + Tailwind + shadcn/ui + React Router
- **Backend:** Node.js + Express
- **Base de dados:** MySQL
- **Dados:** 855 jogadores da API-Football

## Estrutura
```
frontend/
  src/
    pages/         → Landing, Quiz, Leaderboard
    components/ui/ → shadcn Button, Card
    services/      → api.js (chamadas ao backend)
backend/
  routes/          → question.js, auth.js, leaderboard.js
  config/db.js     → ligação MySQL
  server.js        → servidor Express
  scrape.js        → recolha de dados (já executado)
```

## Estado atual
- ✅ Backend completo (autenticação + endpoints testados)
- ✅ Frontend com navegação (Landing → Quiz → Leaderboard)
- ✅ Quiz funcional com dificuldades
- ⏳ Sistema de login (frontend por fazer)
- ⏳ Guardar pontuações (integração por fazer)

## Deploy
- Frontend: Vercel
- Backend + MySQL: Railway