# QuizDaBola ⚽

Plataforma de quiz interativo sobre futebol — identifica jogadores e testa conhecimento de estatísticas das principais ligas mundiais.

**Versão:** 0.9-beta | **Status:** Pré-Deploy ✅

---

## 🚀 Stack

**Frontend:** React 19 · Vite · Tailwind v4 · React Router v6 · i18next  
**Backend:** Node.js · Express · MySQL · JWT

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
✅ **Leaderboards:** Por modo e competição  
✅ **Autenticação:** JWT com bcrypt  
✅ **Bug Reports:** Sistema integrado com tracking (user/page/browser)  
✅ **Lazy Loading:** Code splitting automático  
✅ **100% Responsivo:** Mobile-first design  
✅ **Glassmorphism:** Backgrounds dinâmicos + overlays  
✅ **Animações suaves:** Page transitions + timer gradients

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

- **Tailwind v4** com config inline (`@theme`)
- **Priorização dinâmica** de equipas top via SQL (ORDER BY CASE)
- **Fallbacks automáticos** de dificuldade e stats
- **Sistema multi-competição** com tabelas dinâmicas
- **Filtros adaptativos** por liga (mínimos diferentes PT vs BR)
- **Lazy loading** com React.lazy() + Suspense
- **Internacionalização** completa (PT/EN)

---

## 📋 To-Do Pré-Deploy

- [x] Lazy loading ✅
- [x] Brasileirão integrado ✅
- [x] Placeholder 1v1 Online ✅
- [ ] A11y básico (~2h)
- [ ] Feature-First Refactor (~1h)
- [ ] Testes extensivos (~30min)
- [ ] Deploy frontend (Vercel)
- [ ] Deploy backend (Render + PlanetScale)

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
- Analytics
- Error Boundary

---

**Última atualização:** 25 Fevereiro 2025  
**Próximo marco:** Deploy Beta (~3-4h)