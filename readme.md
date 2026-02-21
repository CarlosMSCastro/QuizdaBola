# QuizDaBola ⚽

Quiz interativo de futebol português — identifica jogadores e testa conhecimento de estatísticas da Liga Portugal.

## 🚀 Stack
- **Frontend:** React 19 + Vite + Tailwind v4 + shadcn/ui + React Router v6 + react-i18next + Swiper
- **Backend:** Node.js + Express + JWT + MySQL
- **Sounds:** MP3 audio feedback (correct/wrong/urgent)

## 📁 Estrutura
```
frontend/src/
  pages/       → Landing, Quiz, StatsQuiz, Leaderboard, Login
  components/  → Navbar, Footer, SeasonSelector, shadcn/ui
  services/    → api.js
  i18n/        → pt.json, en.json
  public/
    sounds/    → correct.mp3, wrong.mp3, urgent.mp3
    images/    → classic.png, stats.png, results.png, logo.png
backend/
  routes/      → question.js, stats-question.js, auth.js, leaderboard.js, competition.js
  config/      → db.js
  server.js
```

## 🎮 Features

### ✅ Modos de Jogo
- **Clássico** — Identifica jogadores por foto
  - Timer: 10 segundos
  - 3 vidas (⚽)
  - 2 ajudas (nacionalidade/equipa) → +5s cada
  - Dificuldade dinâmica: 46% easy, 40% medium, 14% hard
  - Sons: correto/errado/urgente (volume 20-30%)
  - Mute persistente (localStorage)

- **Stats Quiz** — Perguntas sobre estatísticas
  - 2 formatos ativos:
    - **F2 (80%):** Comparação entre 2 jogadores
    - **F3 (20%):** Verdadeiro/Falso
  - Jogadores: 75% easy, 20% medium, 5% hard
  - Stats variadas: golos, assistências, rating, passes, tackles, etc.
  - Reveal de valores após resposta (F2)

### ✅ Core
- **Autenticação:** JWT (7 dias)
- **Leaderboard:** Único por modo + competição (sem filtro de dificuldade)
- **i18n:** PT/EN via react-i18next
- **Dark/Light mode:** Toggle com persistência
- **BD:** 855 jogadores Liga Portugal 2024/25 (67 placeholders filtrados via MD5)
- **Multi-competição:** Sistema preparado (apenas Liga Portugal 24/25 ativa)

### ✅ UI/UX

**Quiz/StatsQuiz:**
- Timer bar progressivo com cores dinâmicas (verde→amarelo→laranja→vermelho)
- Efeitos visuais: glow, glassmorphism, reflexos
- Animações:
  - Timer baixo (≤2s): pulse + ping
  - +5s ao usar ajuda (verde)
  - Tempo esgotado (laranja/vermelho forte)
  - Transições suaves entre páginas (fadeIn 0.3s)
- Feedback imediato: verde (✓) / vermelho (✗)
- Vidas com bolas de futebol (⚽ colorido → grayscale)
- Botões: mute (🔊/🔇) + help (❓) com contador

**Game Over:**
- Score gigante com glow effect
- Notificação de novo record (🏆) apenas se for novo
- Login prompt para guests
- Botões: "Jogar Novamente" / "Voltar ao Início"

**SeasonSelector:**
- Swiper mobile com indicadores
- Grid desktop (3 colunas)
- Hover scale nas imagens
- Locked: Liga Portugal 25/26, Champions League

**Navbar:**
- Desktop: horizontal com dropdown user menu
- Mobile: hamburger menu dropdown
- Logo centralizado em <560px
- Sem navbar: Quiz, StatsQuiz, Leaderboard, Login

**Landing:**
- Desktop: grid 3 colunas
- Mobile: swiper 1 card por vez
- Hover: scale 110% nas imagens
- Click apenas no botão "JOGAR AGORA"

**Footer:**
- Logo pequeno (h-8, opacity-60) em mobile
- Links: GitHub, LinkedIn
- Copyright dinâmico

**Responsive:**
- Mobile-first design
- Breakpoints: 560px, 1024px (lg)

### ⏳ Pendente

**FASE 4 — Polish:**
- [ ] Animações extra (confetti acerto, shake erro intensificado)
- [ ] Acessibilidade (aria-labels, keyboard navigation)
- [ ] Lazy loading de rotas
- [ ] Performance optimizations (code splitting, image optimization)

**FASE 5 — Deploy:**
- [ ] Railway (backend + MySQL)
- [ ] Vercel (frontend)
- [ ] Domínio customizado
- [ ] CI/CD pipeline

**FASE 6 — Futuro:**
- [ ] Modo Resultados (adivinhar resultado de jogos)
- [ ] Champions League + Liga Portugal 25/26
- [ ] Perfil de utilizador (histórico, badges, stats)
- [ ] Multiplayer 1v1 (tempo real)
- [ ] Achievements system
- [ ] Share score nas redes sociais

## 🔧 Tech Notes

**Tailwind v4:**
- Inline config em `index.css`
- Custom properties: `--primary`, `--foreground`, `--background`, etc.
- Dark mode via `.dark` class

**MySQL:**
- 855 jogadores Liga Portugal 2024/25
- Campos: `difficulty`, `overall_rating`, `goals_total`, etc.
- Placeholders filtrados: `is_photo_placeholder = 0`

**JWT:**
- Expiry: 7 dias
- Armazenado em localStorage
- Refresh automático em cada request

**APIs Externas:**
- Bandeiras: `flagcdn.com`
- Logos equipas: armazenados na BD

**Audio:**
- 3 sons: correct, wrong, urgent
- Volumes: 30%, 20%, 30%
- Mute persistente via localStorage

**Probabilidades:**
- **Quiz Clássico:** 46% easy, 40% medium, 14% hard
- **Stats Quiz (formato):** 80% F2, 20% F3
- **Stats Quiz (dificuldade):** 75% easy, 20% medium, 5% hard

## 📝 Convenções

**Cores:**
- Success: verde (#10b981)
- Destructive: vermelho (#ef4444)
- Primary: dourado (#f4d03f)
- Muted: cinza adaptativo

**Animações:**
- Duração padrão: 300ms
- Easing: ease-in-out
- Transições de página: fadeIn com translateY(10px)

**Componentes shadcn/ui:**
- Button, Card, Input
- Totalmente customizados com Tailwind

---

**Última atualização:** Fevereiro 2025