# QuizDaBola ⚽

Plataforma de quiz interativo sobre futebol — identifica jogadores e testa conhecimento de estatísticas das principais ligas mundiais.

**Status:** Deploy Ready 🚀

---

## 🚀 Stack

**Frontend:** React 19 · Vite · Tailwind v4 · React Router v6 · i18next  
**Backend:** Node.js · Express · MySQL · JWT  
**Arquitetura:** Feature-First (Vertical Slicing) · MVC Pattern

---

## 🌍 Competições Disponíveis

### 🇵🇹 Liga Portugal Betclic 2024/25
**788 jogadores ativos** · Sistema Big 5 (Benfica, Porto, Sporting, Braga, Guimarães)

### 🇧🇷 Brasileirão Série A 2024
**914 jogadores ativos** · Sistema Big 5 (Flamengo, Palmeiras, Corinthians, São Paulo, Atlético-MG)

### 🔒 Premier League 2024/25
Coming Soon

---

## 🎮 Modos de Jogo

### ⚽ Classic Quiz
Identifica jogadores por foto — 4 opções de resposta.
- 10s por pergunta | 3 vidas | 2 ajudas (bandeira + logo equipa, +5s cada)
- Sistema de dificuldade adaptativo (easy/medium/hard)
- Áudio dinâmico com mute persistente

### 📊 Stats Battle
Comparações e desafios baseados em estatísticas reais.
- **F2 (80%):** "Quem é mais alto?" — escolher entre 2 jogadores
- **F3 (20%):** "Jogador X tem 180cm ou mais?" — verdadeiro/falso
- Stats: altura, idade, golos, assistências, rating, cartões amarelos
- Priorização automática de equipas top por liga
- Fallback inteligente (age) quando stats específicas falham

### 🔒 1v1 Online
Coming Soon — Desafia amigos em tempo real

---

## ✨ Features

✅ **Multi-competição:** Sistema dinâmico suporta múltiplas ligas  
✅ **Bilingue:** PT/EN com i18next  
✅ **Dark/Light mode:** Persistente em localStorage  
✅ **Leaderboards:** Por modo e competição (Global/Liga)  
✅ **Autenticação:** JWT com bcrypt  
✅ **Bug Reports:** Sistema integrado com tracking (user/page/browser)  
✅ **Lazy Loading:** Code splitting automático (~70% redução bundle)  
✅ **A11y (WCAG 2.1 AA):** Skip links, ARIA labels, navegação por teclado  
✅ **100% Responsivo:** Mobile-first design  
✅ **Glassmorphism:** Backgrounds dinâmicos + overlays  
✅ **Animações suaves:** Page transitions + timer gradients

---

## 🏗️ Arquitetura

### **Frontend (Feature-First)**
```
src/
├── features/           # Features isoladas
│   ├── auth/
│   ├── bug-report/
│   ├── landing/
│   ├── leaderboard/
│   ├── quiz/
│   └── stats-quiz/
├── shared/             # Componentes/serviços partilhados
│   ├── components/
│   ├── constants/
│   └── services/
└── App.jsx
```

### **Backend (MVC + Feature-First)**
```
backend/
├── features/           # Features com routes/controllers/services
│   ├── auth/
│   ├── bug-report/
│   ├── competitions/
│   ├── leaderboard/
│   ├── quiz/
│   └── stats-quiz/
├── shared/             # Utilities partilhados
│   ├── config/
│   └── middleware/
└── server.js
```

**Vantagens:**
- ✅ Código organizado por domínio de negócio
- ✅ Fácil de escalar (adicionar features = nova pasta)
- ✅ Separação clara de responsabilidades
- ✅ Reutilização de middleware/services
- ✅ Preparado para microserviços futuros

---

## 🗄️ Base de Dados

**1702 jogadores totais** (Liga Portugal + Brasileirão)

**Liga Portugal:**
- 788 jogadores ativos
- Dificuldade: 26% easy · 22% medium · 52% hard
- Posições: 87 GK · 251 DEF · 219 MID · 231 ATK/FWD

**Brasileirão:**
- 914 jogadores ativos (3 apps, 150 mins mínimo)
- Height/Weight normalizados (INT)

**Tabelas:** `players_ligaportugal2024`, `players_brasileirao2024`, `competitions`, `users`, `scores`, `bug_reports`

---

## 🔧 Tech Highlights

### **Frontend**
- **Tailwind v4** com config inline (`@theme`)
- **Lazy loading** com React.lazy() + Suspense
- **A11y completo:** ARIA roles, focus management, skip links
- **Internacionalização** completa (PT/EN)
- **Glassmorphism** + gradientes dinâmicos

### **Backend**
- **Feature-First Architecture** (Vertical Slicing)
- **MVC Pattern:** Routes → Controllers → Services
- **Priorização dinâmica** de equipas top via SQL (ORDER BY CASE)
- **Fallbacks automáticos** de dificuldade e stats
- **Sistema multi-competição** com tabelas dinâmicas
- **Filtros adaptativos** por liga (mínimos diferentes PT vs BR)
- **Middleware reutilizável** (auth.middleware.js)

---

## ♿ Acessibilidade (A11y)

✅ **WCAG 2.1 Level AA** compliant  
✅ **Navegação por teclado** (Tab, Enter, Esc)  
✅ **Screen readers** (ARIA labels, roles, live regions)  
✅ **Skip links** (saltar para conteúdo principal)  
✅ **Focus visível** só com teclado (não com rato)  
✅ **Contrast ratios** adequados  
✅ **Semantic HTML** + ARIA attributes

---

## 📋 Changelog v1.0-beta

### **✅ Concluído (26-27 Fev 2025)**

**Performance:**
- ✅ Lazy loading implementado (~70% redução bundle inicial)
- ✅ Code splitting automático por rota

**Acessibilidade:**
- ✅ A11y completo (7 componentes)
- ✅ Skip links bilingues
- ✅ ARIA labels em todos os botões
- ✅ Navegação por teclado funcional
- ✅ Focus management (só teclado)

**Arquitetura:**
- ✅ Frontend Feature-First refactor
- ✅ Backend Feature-First refactor (MVC)
- ✅ 6 features backend separadas (routes/controllers/services)
- ✅ Middleware reutilizável

**Bug Fixes:**
- ✅ saveScore ordem de parâmetros corrigida
- ✅ StatsQuiz enviava 'classic' em vez de 'stats'
- ✅ Leaderboard filtro por competição corrigido

**Conteúdo:**
- ✅ Brasileirão integrado (914 jogadores)
- ✅ Placeholder 1v1 Online

---

## 🚀 Roadmap Pós-Deploy

**Conteúdo:**
- Premier League (scraping)
- Champions League
- Épocas históricas (2023, 2022...)

**Novos Modos:**
- Results Quiz (adivinhar resultados)
- Daily Challenge
- Career Mode (progressão)

**Social:**
- 1v1 real-time (WebSockets)
- Sistema de amigos
- Partilha social (Twitter/Instagram)

**Gamificação:**
- Achievements/Troféus
- XP e níveis
- Badges por milestones
- Profile customization

**Técnico:**
- SEO (meta tags, sitemap)
- PWA (offline support)
- Analytics (Plausible/Umami)
- Error Boundary
- Rate limiting
- Caching (Redis)

---

## 📦 Deploy

**Frontend:** Vercel  
**Backend:** Render  
**Database:** PlanetScale (MySQL)

---

**Última atualização:** 27 Fevereiro 2025  

