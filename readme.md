# Liga Portugal Quiz

Quiz interativo de jogadores da Primeira Liga 2024. Reconhece jogadores por foto, compara estatísticas, e testa conhecimento de resultados.

## Stack
- **Frontend:** React 19 + Vite + Tailwind v4 + shadcn/ui + React Router v6 + react-i18next
- **Backend:** Node.js + Express + JWT + bcrypt
- **Base de dados:** MySQL (788 jogadores válidos, 67 placeholders filtrados)

## Estrutura
```
frontend/
  src/
    pages/           → Landing, Quiz, Leaderboard
    components/      → Navbar, LoginModal, shadcn/ui
    services/api.js  → Axios API calls
    i18n/            → config.js + locales (pt.json, en.json)
backend/
  routes/            → question, auth, leaderboard
  config/db.js       → MySQL pool
  server.js          → Express server
```

## Estado Atual

### ✅ Fase 1 — Completa
- **Modo Clássico funcional:**
  - Timer 8s, 3 vidas, sem repetições
  - Sistema de ajudas (2x): nacionalidade/clube (+5s bonus)
  - Dificuldades: Fácil/Médio/Difícil
- **Autenticação:** Login/registo com JWT, tokens em localStorage
- **Auto-save scores:** Guarda automaticamente se for novo record pessoal
- **Navegação:** Landing → Quiz → Leaderboard (React Router)
- **Backend:** Todos endpoints testados (question, auth, leaderboard)
- **Base de dados:** 855 jogadores + users + scores
- **Placeholder Filter:** 67 fotos genéricas identificadas via MD5 e filtradas do jogo
- **Bandeiras:** Integração com `i18n-iso-countries` — cobertura global com fallback 🌍
- **Navbar responsiva:** Desktop + hamburger mobile, com DarkModeToggle + LanguageToggle
- **Dark Mode:** Toggle funcional, preferência guardada em localStorage
- **i18n:** react-i18next com PT/EN aplicado em todos os componentes
- **Theme Variables:** Paleta neutra (azul/laranja/dourado), light + dark mode

### ⏳ Próximos Passos

#### **FASE 2 — Features (10-12h):**
- [ ] **Stats Battle (4h):**
  - [ ] Backend: endpoint `/api/stats-battle`
  - [ ] Frontend: `StatsBattle.jsx` (2 jogadores, comparar stats)
  - [ ] Mecânica: 8s timer, 3 vidas, 2 ajudas
  
- [ ] **Trivia Resultados (4h):**
  - [ ] Scrape fixtures da API-Football
  - [ ] Backend: endpoint de resultados
  - [ ] Frontend: `Trivia.jsx`
  
- [ ] **Leaderboard por Modo (2h):**
  - [ ] Alterar BD: adicionar campo `game_mode` em `scores`
  - [ ] Filtros: Clássico (easy/med/hard) | Stats Battle | Trivia
  
- [ ] **Perfil do User (2h):**
  - [ ] Página `/profile` com stats agregadas
  - [ ] Clube mais acertado/falhado, win rate, streak máximo

#### **FASE 3 — Expansão (6-8h):**
- [ ] Champions League 2024 (scrape + integração)
- [ ] Selector de competição
- [ ] Leaderboards por competição

#### **FASE 4 — Branding & Polish (6-8h):**
- [ ] Identidade visual final (logo, paleta, tipografia)
- [ ] Animações (hover, transitions, confetti)
- [ ] Loading/error/empty states
- [ ] Responsividade desktop completa
- [ ] Acessibilidade básica + lazy loading

#### **FASE 5 — Deploy (2-3h):**
- [ ] Railway: backend + MySQL cloud
- [ ] Vercel: frontend
- [ ] DNS + domínio (quizdabola.com)

#### **FASE 6 — Multiplayer 1v1 (20h - futuro):**
- [ ] Socket.io, rooms, matchmaking
- [ ] BD: tabela `matches` + `pvp_stats`

## Modos de Jogo Planeados

1. **🎯 Clássico** — Reconhecer jogador pela foto (atual)
2. **📊 Stats Battle** — Comparar estatísticas entre 2 jogadores
3. **🏟️ Trivia** — Perguntas sobre resultados e factos

## Tecnologias de Suporte

- **Bandeiras:** `i18n-iso-countries` + flagcdn.com API
- **Traduções:** react-i18next (PT/EN)
- **Icons:** Lucide React
- **Animações:** Tailwind transitions + tailwindcss-animate

## Deploy Planeado
- **Frontend:** Vercel
- **Backend + MySQL:** Railway
- **Domínio:** quizdabola.com (futuro)