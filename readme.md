# QuizDaBola

Quiz interativo de futebol com múltiplos modos de jogo. Identifica jogadores por foto, testa conhecimento de estatísticas e muito mais.

## Stack
- **Frontend:** React 19 + Vite + Tailwind v4 + shadcn/ui + React Router v6 + react-i18next
- **Backend:** Node.js + Express + JWT + bcrypt
- **Base de dados:** MySQL (788 jogadores válidos, 67 placeholders filtrados)

## Estrutura
```
frontend/
  src/
    pages/           → Landing, Quiz, StatsQuiz, Leaderboard
    components/      → Navbar, LoginModal, shadcn/ui
    services/api.js  → Axios API calls
    i18n/            → config.js + locales (pt.json, en.json)
backend/
  routes/            → question, auth, leaderboard, stats-quiz
  config/db.js       → MySQL pool
  server.js          → Express server
```

## Estado Atual

### ✅ Fase 1 — Completa
- **Modo Clássico funcional:** Timer 8s, 3 vidas, 2 ajudas (nacionalidade/clube +5s), sem repetições, dificuldades Fácil/Médio/Difícil
- **Autenticação:** Login/registo com JWT, tokens em localStorage
- **Auto-save scores:** Guarda automaticamente se for novo record pessoal
- **Leaderboard:** Top scores por dificuldade
- **Base de dados:** 855 jogadores + users + scores
- **Placeholder Filter:** 67 fotos genéricas identificadas via MD5 e filtradas do jogo
- **Bandeiras:** `i18n-iso-countries` com cobertura global e fallback 🌍
- **Navbar responsiva:** Desktop + hamburger mobile, glassmorphism, sticky
- **Dark Mode:** Toggle funcional, azul-acinzentado (não preto puro), preferência persistida
- **i18n:** PT/EN aplicado em todos os componentes, language toggle com bandeiras reais
- **Theme Variables:** Paleta neutra (azul/laranja/dourado), light + dark mode
- **Landing reestruturada:** Carrossel swiper mobile, 3 cards de modos de jogo

### ✅ Fase 2 (parcial) — Stats Quiz
- **3 formatos de pergunta:**
  - **F1** — Adivinhar valor numérico (4 opções plausíveis ±40%)
  - **F2** — Comparar 2 jogadores (diferença máxima 50%), revela valores após resposta
  - **F3** — True/False sobre threshold de stat
- **Stats por posição** com valores mínimos definidos
- **Sem ajudas** neste modo
- **Auto-save** com detecção de record pessoal

### ⏳ Próximos Passos

#### **FASE 2 — Continuar:**
- [ ] **Modo Resultados** — perguntas sobre jogos, golos, minutos (requer scrape de fixtures)
- [ ] **Leaderboard por modo** — adicionar `game_mode` à tabela `scores`
- [ ] **Perfil do User** — página `/profile` com stats agregadas

#### **FASE 4 — Branding & Polish:**
- [ ] Identidade visual final (logo QuizDaBola, paleta, tipografia)
- [ ] Cores da Liga Portugal como accent contextual
- [ ] Animações (hover, confetti, transitions)
- [ ] Loading/error/empty states
- [ ] Acessibilidade básica + lazy loading

#### **FASE 5 — Deploy:**
- [ ] Railway: backend + MySQL cloud
- [ ] Vercel: frontend
- [ ] Domínio: quizdabola.com

#### **FASE 6 — Multiplayer 1v1 (futuro):**
- [ ] Socket.io, rooms, matchmaking
- [ ] BD: tabela `matches` + `pvp_stats`

## Modos de Jogo

1. **🎯 Clássico** — Reconhecer jogador pela foto ✅
2. **📊 Stats Quiz** — Perguntas sobre estatísticas (F1/F2/F3) ✅
3. **🏟️ Resultados** — Perguntas sobre jogos e golos ⏳

## Tecnologias de Suporte

- **Bandeiras:** `i18n-iso-countries` + flagcdn.com
- **Traduções:** react-i18next (PT/EN)
- **Swiper:** Carrossel mobile na Landing
- **Animações:** Tailwind transitions + tailwindcss-animate

## Deploy Planeado
- **Frontend:** Vercel
- **Backend + MySQL:** Railway
- **Domínio:** quizdabola.com