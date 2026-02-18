# Liga Portugal Quiz

Quiz de fotos de jogadores da Primeira Liga 2024. Aparece uma foto, escolhes o nome certo entre 4 opções.

## Stack
- **Frontend:** React + Vite + Tailwind + shadcn/ui
- **Backend:** Node.js + Express
- **Base de dados:** MySQL
- **Dados:** 855 jogadores da API-Football

## Estrutura
```
frontend/          → React + Vite
backend/
  routes/          → question, auth, leaderboard
  config/db.js     → ligação MySQL
  server.js        → servidor Express
  scrape.js        → recolha de dados (já executado)
```

## Estado atual
- ✅ Backend completo (autenticação + endpoints)
- ⏳ Frontend por fazer

## Deploy
- Frontend: Vercel
- Backend + MySQL: Railway