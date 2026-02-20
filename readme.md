# QuizDaBola

Quiz interativo de futebol português — identifica jogadores e testa conhecimento de estatísticas da Liga Portugal.

## Stack
- **Frontend:** React 19 + Vite + Tailwind v4 + shadcn/ui + React Router v6 + react-i18n + Swiper
- **Backend:** Node.js + Express + JWT + MySQL

## Estrutura
```
frontend/src/
  pages/       → Landing, Quiz, StatsQuiz, Leaderboard, Login
  components/  → Navbar, Footer, SeasonSelector, shadcn/ui
  services/    → api.js
  i18n/        → pt.json, en.json
backend/
  routes/      → question, auth, leaderboard, stats-quiz
  server.js
```

## Features

### ✅ Modos de Jogo
- **Clássico** — Identifica jogadores por foto (timer 8s, 3 vidas, 2 ajudas, 3 dificuldades)
- **Stats Quiz** — 3 formatos de perguntas sobre estatísticas (F1: múltipla escolha, F2: comparação, F3: V/F)

### ✅ Core
- Autenticação JWT com login/registo
- Leaderboard com filtros (modo + dificuldade)
- i18n (PT/EN)
- Dark/Light mode
- BD: 855 jogadores Liga Portugal 2024/25

### ✅ UI/UX
- **Quiz/StatsQuiz:** Timer bar progressivo, animações shake/vignette quando tempo crítico, feedback visual verde/vermelho, hover primary nas respostas
- **SeasonSelector:** Swiper mobile, grid desktop, apenas Liga Portugal 24/25 ativo (25/26 e CL locked)
- **Navbar:** Desktop horizontal, mobile dropdown hamburger (centralizado <550px)
- **Landing:** Grid desktop, swiper mobile com indicadores
- **Responsive:** Mobile-first, breakpoints 550px/560px/1024px
- **No navbar/footer:** Quiz, StatsQuiz, Leaderboard, Login

### ⏳ Pendente
**FASE 4 — Polish:**
- [ ] Animações (confetti acerto, shake erro)
- [ ] Acessibilidade (aria-labels, keyboard nav)
- [ ] Lazy loading rotas
- [ ] Performance optimizations

**FASE 5 — Deploy:**
- [ ] Railway (backend + MySQL)
- [ ] Vercel (frontend)
- [ ] Domínio

**FASE 6 — Futuro:**
- [ ] Modo Resultados
- [ ] Champions League + Liga Portugal 25/26
- [ ] Perfil user
- [ ] Multiplayer 1v1

## Tech Notes
- Tailwind v4 inline config
- MySQL: 855 players, 67 placeholders filtered (MD5 hash)
- JWT expiry: 7 days
- Theme: CSS variables (--primary, --foreground, --background, etc.)
- Bandeiras: flagcdn.com API