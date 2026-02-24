# QuizDaBola ⚽

Plataforma de quiz interativo sobre futebol — identifica jogadores e testa conhecimento de estatísticas.

## 🚀 Stack
- **Frontend:** React 19 + Vite + Tailwind v4 + shadcn/ui + React Router + i18next + Swiper
- **Backend:** Node.js + Express + JWT + MySQL
- **Deploy:** (Pendente) Railway + Vercel

## 🎮 Modos de Jogo

### Quiz Clássico
Identifica jogadores por foto (855+ jogadores Liga Portugal 24/25).
- ⏱️ 10s por pergunta | 3 vidas ⚽
- 2 ajudas (nacionalidade/equipa) → +5s cada
- Dificuldade dinâmica: 46% easy, 40% medium, 14% hard
- Áudio: correto/errado/urgente com mute persistente

### Stats Quiz
Perguntas sobre estatísticas dos jogadores.
- **F2 (80%):** Comparação entre 2 jogadores (golos, assistências, rating, etc.)
- **F3 (20%):** Verdadeiro/Falso
- Reveal de valores após resposta
- Dificuldade: 75% easy, 20% medium, 5% hard

### Modo 1v1 Online
🔒 **Em breve** — Desafios em tempo real contra outros jogadores.

## ✅ Features Implementadas

**Core:**
- Autenticação JWT (7 dias)
- Leaderboard global + por competição
- i18n: Português/English
- Dark/Light mode com persistência
- LocalStorage: idioma, tema, última liga/modo escolhido
- Sistema multi-competição (apenas Liga Portugal 24/25 ativa)

**UI/UX:**
- Timer progressivo com cores dinâmicas (verde→vermelho)
- Transições entre páginas: fade + slide direcionais
- Transições entre perguntas: slide de cima
- Game Over: fade + zoom
- Responsive mobile-first (breakpoints: 560px, 1024px)
- Glassmorphism, glow effects, smooth animations

**Navegação:**
- Landing: 2 steps (escolher liga → escolher modo)
- Navbar escondida em: Quiz, StatsQuiz, Leaderboard, Login
- SeasonSelector: Swiper em mobile + desktop

## 📋 Estrutura
```
frontend/src/
  pages/        → Landing, Quiz, StatsQuiz, Leaderboard, Login
  components/   → Navbar, Footer, SeasonSelector
  services/     → api.js
  i18n/         → config.js, locales/pt.json, en.json
  public/
    sounds/     → correct.mp3, wrong.mp3, urgent.mp3, gameover.mp3
    images/     → classic.png, stats.png, results.png, logo.png

backend/
  routes/       → question.js, stats-question.js, auth.js, leaderboard.js, competition.js
  config/       → db.js
  server.js
```

## 🔧 Tech Highlights

**MySQL:**
- 855 jogadores Liga Portugal 2024/25
- Placeholders filtrados (67 removidos via MD5)
- Campos: difficulty, overall_rating, goals_total, assists, etc.

**Tailwind v4:**
- Configuração inline em `index.css`
- Custom properties: `--primary`, `--foreground`, `--background`
- Dark mode via classe `.dark`

**APIs Externas:**
- Bandeiras: flagcdn.com
- Logos: armazenados na BD

**Audio:**
- 4 sons (correct, wrong, urgent, gameover)
- Volume: 10% (0.1)
- Mute global por modo (localStorage)

## ⏳ Pré-Deploy (Pendente)

**Crítico:**
- [ ] Corrigir erro 404 Stats Quiz (perguntas insuficientes/fallback)
- [ ] Corrigir nomes estranhos (MT, Álvaro Carreras → Fernandez, Pepê → Aquino)
- [ ] Repensar Stats Quiz (perguntas mais intuitivas: altura, valor mercado, minutos/golo)
- [ ] Melhorar ajudas Stats Quiz (mostrar valor de um jogador no F2)
- [ ] Lazy loading de rotas

**Importante:**
- [ ] Adicionar Liga Brasileira (Brasileirão 2024)
- [ ] A11y básico (aria-labels, keyboard nav, contrast)
- [ ] Mais jogadores dos 3 grandes (Benfica, Porto, Sporting)

**Nice to have:**
- [ ] Feature-first refactor
- [ ] SEO (meta tags, Open Graph, sitemap)

## 🚀 Roadmap Futuro

- Modo Resultados (adivinhar resultados de jogos)
- Mais competições (Champions League, Liga Portuguesa 25/26, outros países)
- Perfil de utilizador (histórico, badges, estatísticas)
- Multiplayer 1v1 em tempo real (WebSockets)
- Achievements system
- Share score (redes sociais)

---

**Última atualização:** Fevereiro 2025  
**Status:** 🟡 Pré-Deploy (correções finais)