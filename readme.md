# QuizDaBola

Quiz interativo de futebol — identifica jogadores, testa estatísticas e muito mais.

## Stack
- **Frontend:** React 19 + Vite + Tailwind v4 + shadcn/ui + React Router v6 + react-i18next
- **Backend:** Node.js + Express + JWT + bcrypt + MySQL

## Estrutura
```
frontend/src/
  pages/       → Landing, Quiz, StatsQuiz, Leaderboard
  components/  → Navbar, LoginModal, shadcn/ui
  services/    → api.js
  i18n/        → config.js + locales (pt.json, en.json)
backend/
  routes/      → question, auth, leaderboard, stats-quiz
  config/      → db.js
  server.js
```

## Estado Atual

### ✅ Completo
- **Modo Clássico** — Timer 8s, 3 vidas, 2 ajudas, 3 dificuldades, sem repetições
- **Stats Quiz** — 3 formatos (F1 adivinhar, F2 comparar, F3 true/false), stats por posição
- **Leaderboard** — por modo (Clássico/Stats) e dificuldade (só Clássico)
- **Autenticação** — Login/registo JWT, auto-save de records pessoais
- **Navbar** — Glassmorphism, sticky, dark mode, language toggle PT/EN
- **Landing** — Carrossel swiper mobile, 3 cards de modos
- **i18n** — PT/EN em todos os componentes
- **Dark Mode** — Azul-acinzentado, preferência persistida
- **BD** — 788 jogadores válidos, 67 placeholders filtrados via MD5

### ⏳ A Fazer

- [ ] **Branding & Polish** — identidade visual mobile-first, verde como cor base, accent por competição, animações
- [ ] **Multiplayer 1v1** — Socket.io, rooms, leaderboard de wins
- [ ] **Deploy** — Railway (backend) + Vercel (frontend) + quizdabola.com
- [ ] **V2** — Liga Portugal 2025, Champions League, Modo Resultados

## Modos de Jogo
1. **🎯 Clássico** ✅
2. **📊 Stats Quiz** ✅
3. **🏟️ Resultados** ⏳
4. **⚔️ 1v1 Online** ⏳