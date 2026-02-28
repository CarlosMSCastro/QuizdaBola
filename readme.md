# QuizDaBola ⚽

Plataforma de quiz interativo sobre futebol português e brasileiro — identifica jogadores e testa conhecimento de estatísticas.

---

## 🚀 Stack

**Frontend:** React 19 · Vite · Tailwind v4 · React Router · i18next  
**Backend:** Node.js · Express · MySQL · JWT  
**Arquitetura:** Feature-First (MVC Pattern)

---

## 🎮 Modos de Jogo

### ⚽ Classic Quiz
Identifica jogadores por foto entre 4 opções.
- 10s por pergunta | 3 vidas | 2 ajudas (+5s cada)
- Sistema de dificuldade adaptativo
- Áudio dinâmico com mute persistente

### 📊 Stats Battle
Comparações baseadas em estatísticas reais.
- **F2 (80%):** Comparar 2 jogadores (altura, golos, idade...)
- **F3 (20%):** Verdadeiro/Falso sobre stats de 1 jogador
- Priorização automática de equipas top

---

## 🌍 Competições

### 🇵🇹 Liga Portugal Betclic 2024/25
**788 jogadores** · Big 5: Benfica, Porto, Sporting, Braga, Guimarães

### 🇧🇷 Brasileirão Série A 2024
**914 jogadores** · Big 5: Flamengo, Palmeiras, Corinthians, São Paulo, Atlético-MG

### 🔒 Premier League, Champions League
Coming Soon

---

## ✨ Features

✅ Multi-competição com seleção dinâmica  
✅ Bilingue (PT/EN)  
✅ Dark/Light mode persistente  
✅ Leaderboards por modo e competição  
✅ Autenticação JWT  
✅ Bug Reports integrado  
✅ Lazy Loading (~70% redução bundle)  
✅ A11y WCAG 2.1 AA (navegação teclado, ARIA, skip links)  
✅ 100% Responsivo (mobile-first)  
✅ Glassmorphism + animações suaves

---

## 🏗️ Arquitetura

### Frontend (Feature-First)
```
src/
├── features/           # Quiz, Stats, Landing, Leaderboard, Auth, Bug Report
├── shared/             # Componentes, serviços, constants
└── App.jsx
```

### Backend (MVC + Feature-First)
```
backend/
├── features/           # Routes → Controllers → Services
│   ├── quiz/
│   ├── stats-quiz/
│   ├── leaderboard/
│   └── ...
├── shared/             # Config, middleware
└── server.js
```

---

## 🗄️ Base de Dados

**1702 jogadores** (Liga Portugal + Brasileirão)

**Tabelas:** `players_ligaportugal2024`, `players_brasileirao2024`, `competitions`, `users`, `scores`, `bug_reports`

**Sistema:**
- Dificuldade adaptativa (easy/medium/hard)
- Priorização de equipas top
- Fallbacks automáticos de stats

---

## 📦 Deploy

**Frontend:** Vercel  
**Backend:** Fly.io  
**Database:** PlanetScale (MySQL)

---

## 🚀 Roadmap

**Conteúdo:** Premier League, La Liga, Champions League  
**Modos:** 1v1 Online, Daily Challenge, Career Mode  
**Social:** Sistema de amigos, partilha social  
**Gamificação:** Achievements, XP, badges  
**Técnico:** PWA, SEO, caching, analytics