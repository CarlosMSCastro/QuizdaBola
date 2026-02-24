# QuizDaBola ⚽

Plataforma de quiz interativo sobre futebol português — identifica jogadores e testa conhecimento de estatísticas.

## 🚀 Stack Tecnológica
- **Frontend:** React 19 + Vite + Tailwind v4 + shadcn/ui + React Router v6 + i18next + Swiper
- **Backend:** Node.js + Express + JWT + MySQL
- **Deploy:** (Pendente) Railway/Render + Vercel

## 🎮 Modos de Jogo

### Quiz Clássico
Identifica jogadores da Liga Portugal por foto (788 jogadores ativos, época 24/25).
- ⏱️ 10s por pergunta | 3 vidas ⚽
- 2 ajudas aleatórias (nacionalidade/logo equipa) → +5s cada
- Dificuldade dinâmica baseada em overall_rating: 46% easy, 40% medium, 14% hard
- Sistema de áudio: correto/errado/urgente/gameover com mute persistente por modo

### Stats Quiz
Perguntas baseadas em estatísticas reais dos jogadores.
- **F2 (80%):** Comparação entre 2 jogadores (golos, assistências, remates, dribles, passes, rating, etc.)
- **F3 (20%):** Verdadeiro/Falso sobre stat específica
- Reveal de valores estatísticos após resposta (apenas F2)
- Filtros: posição, appearences ≥5, minutos ≥300
- Dificuldade ajustada: 40% easy, 35% medium, 25% hard (baseado na distribuição real da BD)
- 2 ajudas (+5s cada) — **sistema de hints a ser reestruturado**

### Modo 1v1 Online
🔒 **Em breve** — Card placeholder no Landing com "Coming Soon"

## ✅ Features Implementadas

**Core:**
- Autenticação JWT (duração: 7 dias, httpOnly cookies)
- Leaderboard global + filtro por competição (Liga Portugal 24/25)
- Internacionalização (i18n): Português/English com React i18next
- Dark/Light mode com toggle persistente (localStorage)
- Sistema multi-competição preparado (apenas Liga Portugal ativa, outras bloqueadas com 🔒)

**UI/UX:**
- Timer progressivo com gradientes dinâmicos (verde → amarelo → laranja → vermelho) + glow effects
- Page transitions: fade + slide direcionais (Landing ↔ outras páginas)
- Question transitions: fade + slide-in-from-top (300ms)
- Game Over: fade + zoom-in (500ms)
- Design mobile-first totalmente responsivo (breakpoints: 560px mobile, 1024px desktop)
- Glassmorphism effects, drop shadows, smooth scale animations
- Feedback visual: correct (verde), wrong (vermelho), timer urgente (pulsante)

**Navegação & Flow:**
- Landing em 2 steps:
  1. SeasonSelector (escolher liga) → botão "JOGAR AGORA"
  2. GameModeSelector (swiper com Classic/Stats/Results) → botão "COMEÇAR"
- Navbar escondida em: Quiz, StatsQuiz, Leaderboard, Login
- Footer sempre visível
- SeasonSelector: Swiper adaptativo (mobile 1 slide, desktop 3 slides)
- Botão "Abandonar" em Quiz/StatsQuiz para voltar ao Landing

**Persistência (localStorage):**
- `selectedSeason` → última liga escolhida
- `lastMode` → último modo jogado (path: /quiz ou /stats-quiz)
- `landingStep` → step atual do Landing (1 ou 2)
- `quizMuted` / `statsQuizMuted` → estado do mute por modo
- `leaderboardMode` / `leaderboardLeague` → filtros do leaderboard
- `i18nextLng` → idioma selecionado
- `darkMode` → tema (true/false)
- `token` / `user` → autenticação

## 📂 Estrutura de Ficheiros
```
frontend/src/
  pages/
    Landing.jsx         → 2-step flow (SeasonSelector → GameModeSelector)
    Quiz.jsx            → Classic mode (photo identification)
    StatsQuiz.jsx       → Stats-based questions (F2/F3 formats)
    Leaderboard.jsx     → Global + per-competition rankings
    Login.jsx           → Auth (login/register tabs)
    TestAnimations.jsx  → Animation testing page (/test-animations)
  components/
    Navbar.jsx          → Top navigation (hide em quiz pages)
    Footer.jsx          → Credits + language/theme toggles
    SeasonSelector.jsx  → Competition picker (Swiper component)
    GameModeSelector.jsx→ Game mode picker (extracted from Landing)
    EndGame.jsx         → Shared game over screen (Quiz + StatsQuiz)
    ui/
      card.jsx          → shadcn/ui Card component (usado)
      badge.jsx         → (obsoleto, não usado)
      button.jsx        → (obsoleto, não usado)
      dialog.jsx        → (obsoleto, não usado)
  services/
    api.js              → Axios wrapper para backend
  i18n/
    config.js           → i18next setup
    locales/
      pt.json           → Traduções PT
      en.json           → Traduções EN
  constants/
    gameModes.js        → Array `modes` (classic/stats/results configs)
  public/
    sounds/             → correct.mp3, wrong.mp3, urgent.mp3, gameover.mp3, highscore.mp3
    images/             → classic.png, stats.png, results.png, logo.png

backend/
  routes/
    question.js         → GET /api/question (Classic Quiz)
    stats-question.js   → GET /api/stats-quiz (Stats Quiz - F2/F3 formats)
    auth.js             → POST /api/register, /api/login
    leaderboard.js      → GET /api/leaderboard/classic, /api/leaderboard/stats
    competition.js      → GET /api/competitions, GET /api/competition/:id
  config/
    db.js               → MySQL connection pool
  server.js             → Express app + middleware + CORS
```

## 🗄️ Base de Dados

**Tabela: `players_ligaportugal2024`**
- **Total:** 855 jogadores scraped
- **Ativos:** 788 (is_photo_placeholder = 0, 67 placeholders MD5 removidos)
- **Dificuldade:** easy=206 (26%), medium=172 (22%), hard=410 (52%)
- **Posições:** Goalkeeper=87, Defender=251, Midfielder=219, Attacker=218, Forward=13
- **Campos principais:** id, name, firstname, lastname, photo, team_name, team_logo, position, nationality, age, rating, difficulty, goals_total, goals_assists, shots_total, passes_total, tackles_total, appearences, minutes, cards_yellow, etc.
- **Correções manuais aplicadas:** MT → Matheus Reis, Álvaro Fernández → Álvaro Carreras, Pepê → Pepê Aquino

**Tabela: `competitions`**
- Liga Portugal 2024 (active=1, table_name=players_ligaportugal2024)
- Outras competições (active=0, locked com 🔒)

**Tabela: `users`**
- id, username, email, password (bcrypt hash), created_at

**Tabela: `scores`**
- id, user_id, score, mode (classic/stats), competition_id, created_at

## 🔧 Tech Highlights

**Tailwind CSS v4:**
- Configuração inline em `index.css` via `@theme`
- Sistema de cores: oklch() para melhor consistência
- Custom properties: `--primary`, `--foreground`, `--background`, `--success`, etc.
- Dark mode via classe `.dark` (scoped variant)
- Animações customizadas: shake, fadeIn, Tailwind animate plugin

**Audio System:**
- 5 sons: correct, wrong, urgent, gameover, highscore
- Volume fixo: 0.1 (10%)
- Mute persistente por modo (quizMuted, statsQuizMuted separados)
- Urgent sound toca aos 3s restantes
- Highscore sound apenas quando novo recorde

**APIs Externas:**
- **Bandeiras:** flagcdn.com (48x36 PNG)
- **Logos equipas:** Armazenados na BD (URLs absolutas)

**Componentização:**
- EndGame partilhado entre Quiz/StatsQuiz (mode prop: 'classic'/'stats')
- GameModeSelector extraído do Landing (modes array em constants)
- Transições geridas por PageTransition wrapper no App.jsx

## 📝 Convenções de Código

**ESLint:**
- Warnings silenciados onde apropriado: `/* eslint-disable react-hooks/exhaustive-deps */`
- Funções declaradas ANTES dos useEffect que as chamam (evitar hoisting issues)
- Props não usadas removidas (user, onLogin, setters não usados)

**State Management:**
- localStorage para persistência cross-session
- useState para UI state local
- No global state library (Redux/Zustand) — simplicidade mantida

**Naming:**
- Componentes: PascalCase (EndGame.jsx)
- Funções: camelCase (loadQuestion, handleAnswer)
- Constants: UPPER_SNAKE_CASE em alguns casos, camelCase em arrays (modes)

## ⏳ Tarefas Pendentes (Pré-Deploy)

### 🔴 **Crítico** (5-6h)

- [x] ~~Corrigir erro 404 Stats Quiz~~ ✅ **RESOLVIDO**
  - [x] Adicionado 'Forward' às posições attacking/universal
  - [x] Distribuição de dificuldade ajustada (40/35/25)
  - [x] Fallback sem filtro de dificuldade implementado
- [x] ~~Corrigir nomes estranhos~~ ✅ **RESOLVIDO**
  - [x] MT → Matheus Reis
  - [x] Álvaro Fernández → Álvaro Carreras
  - [x] Pepê → Pepê Aquino
- [ ] **Repensar Stats Quiz** (~3h)
  - [ ] Remover perguntas vagas ("teve mais de 32 passes certeiros")
  - [ ] Adicionar stats intuitivas: altura, valor de mercado, minutos por golo, idade
  - [ ] Reestruturar sistema de ajudas F2 (mostrar valor de UM jogador em vez de hints genéricas)
  - [ ] Priorizar jogadores dos Big 3 + Braga nas queries (weight by team_name)
- [ ] **Lazy loading** (~1h)
  - [ ] Implementar React.lazy() nas rotas (Quiz, StatsQuiz, Leaderboard, Login)
  - [ ] Adicionar Suspense com loading spinner
- [ ] **Placeholder 1v1 mode** (~30min)
  - [ ] Card "Coming Soon" já existe no GameModeSelector (available: false)
  - [ ] Adicionar modal explicativo ao clicar (opcional)

### 🟡 **Importante** (6-8h)

- [ ] **Liga Brasileira** (~4-6h)
  - [ ] Scraping API-Football (Brasileirão Série A 2024)
  - [ ] Popular nova tabela `players_brasileirao2024`
  - [ ] Adicionar à tabela `competitions` (active=1)
  - [ ] Testar ambas as ligas no Quiz/StatsQuiz
  - [ ] Revisão manual de nomes (esperar edge cases tipo Neymar/Vini Jr/Gabigol)
- [ ] **A11y básico** (~2h)
  - [ ] aria-labels em botões icon-only (mute, help, back)
  - [ ] Keyboard navigation (Tab, Enter, Escape)
  - [ ] Focus visible states (outline/ring)
  - [ ] Contrast checker (WCAG AA mínimo)
- [ ] **Priorizar Big 3 + Braga no Stats Quiz** (~30min)
  - [ ] Ajustar queries para dar weight a Benfica/Porto/Sporting/Braga

### 🟢 **Polish** (1-2h)

- [ ] **Feature-first refactor** (~30min)
  - [ ] Reorganizar pastas por feature (opcional, baixa prioridade)
- [ ] **SEO básico** (~1h)
  - [ ] Meta tags (title, description, keywords)
  - [ ] Open Graph tags (og:image, og:title, og:description)
  - [ ] Favicon multi-size
  - [ ] sitemap.xml

### ⏱️ **Timeline Estimado:**
- **Mínimo viável (deploy):** ~5-6h (críticos)
- **Deploy profissional:** ~1 semana (todos os itens)

## 🚀 Roadmap Futuro (Pós-Deploy)

**Novos Modos:**
- [ ] Modo Resultados (adivinhar placares de jogos reais)
- [ ] Modo Carreira (progressão de dificuldade, unlocks)
- [ ] Daily Challenge (1 quiz por dia, leaderboard diário)

**Expansão de Conteúdo:**
- [ ] Mais competições: Champions League, Premier League, La Liga, Bundesliga, Série A
- [ ] Liga Portuguesa 25/26 (quando iniciar época)
- [ ] Histórico de épocas (23/24, 22/23, etc.)

**Features Sociais:**
- [ ] Multiplayer 1v1 em tempo real (WebSockets)
- [ ] Sistema de amigos
- [ ] Partilha de score (Twitter/X, Instagram stories)
- [ ] Desafios personalizados (criar quiz custom)

**Gamificação:**
- [ ] Perfil de utilizador (histórico, estatísticas pessoais)
- [ ] Sistema de achievements/badges
- [ ] XP e níveis
- [ ] Skins/temas customizáveis

**Melhorias Técnicas:**
- [ ] PWA (Progressive Web App)
- [ ] Offline mode
- [ ] Analytics (plausible.io ou umami)
- [ ] Error boundary + Sentry
- [ ] E2E tests (Playwright)

---

**Última atualização:** 24 Fevereiro 2025  
**Status:** 🟡 Pré-Deploy (correções finais em curso)  
**Versão:** 0.9-beta