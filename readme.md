# Liga Portugal Quiz

Quiz de fotos de jogadores da Primeira Liga. Aparece uma foto, escolhes o nome certo entre 4 opções.

## Stack
- **Frontend:** React + Vite + Tailwind + shadcn/ui
- **Backend:** Node.js + Express
- **Base de dados:** MySQL
- **Dados:** API-Football (season 2024)

## Base de dados
855 jogadores recolhidos via scrape, guardados em MySQL. O jogo nunca chama a API diretamente — lê sempre da base de dados.

**Dificuldade:**
- Fácil → jogadores dos 3 grandes com aparições, ou 30+ jogos nas outras equipas
- Médio → suplentes dos 3 grandes, ou 15-29 jogos nas outras equipas
- Difícil → toda a gente else

## Estrutura
```
frontend/          → React
backend/
  routes/          → endpoints Express (question, auth, leaderboard)
  config/db.js     → ligação MySQL
  server.js        → servidor Express
  .env             → variáveis de ambiente (não vai para o GitHub)
```

---

## Próximos passos
- [ ] `routes/question.js` — devolve foto + 4 opções
- [ ] `routes/leaderboard.js` — guarda e lê pontuações
- [ ] `routes/auth.js` — registo e login
- [ ] Interface React do quiz
- [ ] Página de leaderboard
- [ ] Dark mode + responsivo

## Futuro
- Modo de stats ("quem marcou mais golos?")
- Comparação entre épocas (2023 vs 2024)
- Mais ligas (Premier League, La Liga...)