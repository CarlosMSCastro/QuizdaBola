
# Liga Portugal Quiz

Quiz interativo de jogadores da Primeira Liga 2024. Dois modos de jogo: reconhecer jogadores por foto ou comparar estatísticas.

## Stack
- **Frontend:** React 19 + Vite + Tailwind v4 + shadcn/ui + React Router v6
- **Backend:** Node.js + Express + JWT + bcrypt
- **Base de dados:** MySQL (855 jogadores scraped)
- **APIs:** API-Football (dados) + flagcdn.com (bandeiras)

## Estrutura
```
frontend/
  src/
    pages/           → Landing, Quiz, Leaderboard
    components/      → LoginModal, shadcn/ui (Button, Card, Badge, Dialog)
    services/api.js  → Axios calls ao backend
backend/
  routes/            → question.js, auth.js, leaderboard.js
  config/db.js       → MySQL pool
  server.js          → Express server (porta 3000)
  scrape.js          → Script de dados (executado)
```

## Estado Atual

### ✅ **Modo Clássico Completo:**
- Timer 8s por pergunta, 3 vidas
- Sistema de ajudas (2x): revela nacionalidade ou clube (+5s bonus)
- Sem repetir jogadores no mesmo jogo
- Dificuldades: Fácil/Médio/Difícil
- Login/registo com JWT
- Guardar pontuações no leaderboard
- Navegação multi-page funcional

### ⏳ **Por Implementar:**
- **Stats Battle:** modo de comparação de estatísticas (2 jogadores lado a lado)
- Leaderboard por modo de jogo (classic vs stats_battle)
- Branding & polish visual (cores, logo, animações)
- Deploy (Vercel + Railway)

## Deploy Planeado
- Frontend: Vercel
- Backend + MySQL: Railway