# Liga Portugal Quiz

Quiz interativo de jogadores da Primeira Liga 2024. Reconhece jogadores por foto, compara estatísticas, e testa conhecimento de resultados.

## Stack
- **Frontend:** React 19 + Vite + Tailwind v4 + shadcn/ui + React Router v6
- **Backend:** Node.js + Express + JWT + bcrypt
- **Base de dados:** MySQL (855 jogadores scraped via API-Football)

## Estrutura
```
frontend/
  src/
    pages/           → Landing, Quiz, Leaderboard
    components/      → LoginModal, shadcn/ui components
    services/api.js  → Axios API calls
backend/
  routes/            → question, auth, leaderboard
  config/db.js       → MySQL pool
  server.js          → Express server
```

## Estado Atual

### ✅ Completo
- **Modo Clássico funcional:**
  - Timer 8s, 3 vidas, sem repetições
  - Sistema de ajudas (2x): nacionalidade/clube (+5s bonus)
  - Dificuldades: Fácil/Médio/Difícil
- **Autenticação:** Login/registo com JWT, tokens em localStorage
- **Navegação:** Landing → Quiz → Leaderboard (React Router)
- **Backend:** Todos endpoints testados (question, auth, leaderboard)
- **Base de dados:** 855 jogadores + users + scores

### 🔄 Em Progresso
- [ ] **FASE 1 — Fundações (3-4h):**
  - [x] Theme Variables setup — CSS com branding colors
  - [ ] Refactor componentes atuais (cores hardcoded → variáveis)
  - [ ] i18n setup (react-i18next PT/EN)
  - [ ] Utility classes comuns

### ⏳ Próximos Passos

#### **FASE 2 — Features (10-12h):**
- [ ] **Stats Battle (4h):**
  - [ ] Backend: endpoint `/api/stats-battle`
  - [ ] Frontend: `StatsBattle.jsx` (2 jogadores, comparar stats)
  - [ ] Mecânica: 8s timer, 3 vidas, 2 ajudas
  - [ ] Sem dificuldade (geral)
  
- [ ] **Trivia Resultados (4h):**
  - [ ] Scrape fixtures da API-Football
  - [ ] Backend: endpoint de resultados
  - [ ] Frontend: `Trivia.jsx`
  - [ ] Perguntas sobre jogos/equipas
  
- [ ] **Leaderboard por Modo (2h):**
  - [ ] Alterar BD: adicionar campo `game_mode` em `scores`
  - [ ] Filtros: Clássico (easy/med/hard) | Stats Battle | Trivia
  
- [ ] **Perfil do User (2h):**
  - [ ] Página `/profile` com stats agregadas
  - [ ] Clube mais acertado/falhado
  - [ ] Jogador favorito
  - [ ] Win rate, streak máximo

#### **FASE 3 — Expansão (6-8h):**
- [ ] **Champions League 2024:**
  - [ ] Scrape ~855 jogadores Champions
  - [ ] Adicionar à BD (campo `competition`)
  - [ ] Selector competição (híbrido: dropdown desktop, tabs mobile)
  - [ ] Mesmos 3 modos para Champions
  - [ ] Leaderboards por competição

#### **FASE 4 — Branding & Polish (6-8h):**
- [ ] Definir identidade visual (logo, paleta final, tipografia)
- [ ] Trocar theme variables (cores finais)
- [ ] Animações (hover, transitions, confetti)
- [ ] Loading states profissionais
- [ ] Empty/error states
- [ ] Responsividade desktop completa
- [ ] Acessibilidade básica (aria-labels, keyboard nav)
- [ ] Lazy loading de componentes

#### **FASE 5 — Deploy (2-3h):**
- [ ] Railway: backend + MySQL cloud
- [ ] Vercel: frontend
- [ ] Variáveis de ambiente produção
- [ ] CORS configurado
- [ ] Testes smoke (jogo completo funcionando)
- [ ] DNS + domínio custom (opcional)

#### **FASE 6 — Multiplayer 1v1 (20h - futuro):**
- [ ] Socket.io (backend + frontend)
- [ ] Sistema de rooms/matchmaking
- [ ] Sincronização tempo real
- [ ] UI: lobby + battle
- [ ] BD: tabela `matches` + `pvp_stats`

## Modos de Jogo Planeados

1. **🎯 Clássico** — Reconhecer jogador pela foto (atual)
2. **📊 Stats Battle** — Comparar estatísticas entre 2 jogadores
3. **🏟️ Trivia** — Perguntas sobre resultados e factos

## Tecnologias de Suporte

- **Bandeiras:** flagcdn.com API
- **Traduções:** react-i18next (PT/EN)
- **Animações:** Tailwind transitions + tailwindcss-animate
- **Icons:** Lucide React (quando necessário)

## Deploy Planeado
- **Frontend:** Vercel
- **Backend + MySQL:** Railway
- **Domínio:** quizdabola.com (futuro)

