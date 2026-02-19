# QuizDaBola

Quiz interativo de futebol — identifica jogadores, testa estatísticas e muito mais.

## Stack
- **Frontend:** React 19 + Vite + Tailwind v4 + shadcn/ui + React Router v6 + react-i18next + Swiper
- **Backend:** Node.js + Express + JWT + bcrypt + MySQL

## Estrutura
```
frontend/src/
  pages/       → Landing, Quiz, StatsQuiz, Leaderboard, Login
  components/  → Navbar, shadcn/ui (Button, Card, Badge, Dialog)
  services/    → api.js
  i18n/        → config.js + locales (pt.json, en.json)
backend/
  routes/      → question, auth, leaderboard, stats-quiz
  config/      → db.js
  server.js
```

## Estado Atual

### ✅ Completo (FASE 1 + Polish em progresso)

**Core Funcional:**
- **Modo Clássico** — Timer 8s, 3 vidas, 2 ajudas (nacionalidade/clube), 3 dificuldades, sem repetições
- **Stats Quiz** — 3 formatos de pergunta (F1: opções múltiplas, F2: comparação lado a lado, F3: verdadeiro/falso)
- **Leaderboard** — Filtros por modo (classic/stats) e dificuldade (easy/medium/hard para Clássico)
- **Autenticação** — Sistema JWT completo, página de login dedicada com redirect, auto-save de pontuações
- **i18n** — PT/EN aplicado em todos os componentes, placeholders dinâmicos
- **Dark Mode** — Tema completo com variáveis CSS (light/dark), preferência persistida em localStorage
- **BD** — 788 jogadores válidos (Liga Portugal 2024), 67 placeholders filtrados via Python script (MD5 hash)

**UI/UX:**
- **Navbar** — Responsiva (desktop + mobile), dark mode toggle, language switcher (PT/EN), hover effects + scale animations
- **Landing** — Desktop: grid 3 colunas | Mobile: Swiper carrossel com indicadores
- **Login** — Página dedicada (sem modal), modo dinâmico (login/registo via URL params), autofill styling corrigido
- **Theme System** — Paleta neutra profissional (amarelo primary, verde secundário), todas as cores usando variáveis CSS

**Técnico:**
- Todas as cores hardcoded refatoradas para variáveis theme
- Placeholder detection via MD5 hash (Python script)
- Filtros automáticos de placeholders no backend
- Bandeiras via flagcdn.com API com fallback

### ⏳ A Fazer

**FASE 4 — Branding & Polish (em progresso):**
- [ ] Definir identidade visual final (logo, paleta definitiva, tipografia)
- [ ] Animações (confetti no acerto, shake no erro, transitions suaves)
- [ ] Responsividade desktop completa (otimizar layouts)
- [ ] Acessibilidade (aria-labels, navegação por teclado)
- [ ] Lazy loading (React.lazy nas rotas)
- [ ] Otimizações de performance

**FASE 5 — Deploy:**
- [ ] Railway: backend + MySQL cloud
- [ ] Vercel: frontend
- [ ] DNS + domínio (quizdabola.com)

**FASE 6 — Features Futuras:**
- [ ] Modo Resultados (scrape fixtures API-Football)
- [ ] Champions League 2024 (integração multi-competição)
- [ ] Perfil do user (stats, clube favorito, win rate)
- [ ] Multiplayer 1v1 (Socket.io, rooms, matchmaking)

## Modos de Jogo
1. **⚽ Clássico** ✅ — Identifica jogadores pela foto
2. **📊 Stats Quiz** ✅ — Compara estatísticas entre jogadores
3. **🏟️ Resultados** ⏳ — Adivinha resultados e golos
4. **⚔️ 1v1 Online** ⏳ — Multiplayer em tempo real

## Notas Técnicas
- React Router v6 (downgrade de v7 por incompatibilidade)
- Tailwind v4 inline config (sem tailwind.config.js tradicional)
- shadcn/ui componentes copiados ao projeto (customizáveis)
- MySQL pool: 10 conexões simultâneas
- JWT expiry: 7 dias