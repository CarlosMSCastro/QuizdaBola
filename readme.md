# QuizDaBola ⚽

Plataforma de quiz interativo sobre Futebol — identifica jogadores e testa conhecimento de estatísticas.

**🌐 Live:** [quizdabola.vercel.app](https://quizdabola.vercel.app)

---

## 🚀 Stack

**Frontend:** React 19 · Vite · Tailwind v4 · React Router · i18next  
**Backend:** Node.js · Express · MySQL · JWT  
**Deploy:** Vercel · Render · Filess.io  
**Arquitetura:** Feature-First (MVC)

---

## 🎮 Modos de Jogo

### ⚽ Classic Quiz
Identifica jogadores por foto entre 4 opções.
- 10s por pergunta | 3 vidas | 2 ajudas (+5s)
- Áudio dinâmico

### 📊 Stats Battle
Comparações baseadas em estatísticas reais.
- **F2 (80%):** Comparar 2 jogadores (altura, golos, idade...)
- **F3 (20%):** Verdadeiro/Falso sobre stats
- Priorização automática de equipas top

---

## 🌍 Competições

### 🇵🇹 Liga Portugal 2024/25
**788 jogadores** 

### 🇧🇷 Brasileirão 2024
**914 jogadores** 

### 🔒 Em Breve
Premier League · Champions League

---

## ✨ Features

✅ Multi-competição com seleção dinâmica  
✅ Bilingue (PT/EN)  
✅ Dark/Light mode  
✅ Leaderboards globais e por liga  
✅ Autenticação JWT + bcrypt  
✅ Bug Reports integrado  
✅ Lazy Loading (~70% redução bundle)  
✅ A11y  
✅ 100% Responsivo mobile-first 
✅ Zero cold starts (UptimeRobot)

---

## 🏗️ Arquitetura

### Frontend (Feature-First)
```
src/
├── features/      # Quiz, Stats, Leaderboard, Auth, Bug Report
├── shared/        # Componentes, services, constants
└── App.jsx
```

### Backend (MVC)
```
backend/
├── features/      # Routes → Controllers → Services
├── shared/        # Config, middleware
└── server.js
```

---

## 🗄️ Database

**1702 jogadores** (Liga Portugal + Brasileirão)

**Tabelas:** `players_*`, `competitions`, `users`, `scores`, `bug_reports`

**Sistema:**  Priorização equipas top · Fallbacks automáticos

---

## 📦 Deploy

**Frontend:** Vercel (auto-deploy)  
**Backend:** Render.com (750h/mês grátis)  
**Database:** Filess.io MySQL (10MB)  
**Uptime:** UptimeRobot (ping 5min)

---

## 🚀 Roadmap

**Conteúdo:** Premier League, La Liga, Champions League  
**Modos:** 1v1 Online, Daily Challenge, Career Mode  
**Social:** Sistema de amigos, partilha social  
**Gamificação:** Achievements, XP, badges  
**Técnico:** PWA, SEO, caching, analytics

---
