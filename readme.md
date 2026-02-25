# QuizDaBola ⚽

Plataforma de quiz interativo sobre futebol português — identifica jogadores e testa conhecimento de estatísticas.

**Versão:** 0.9-beta | **Status:** Pré-Deploy ✅

---

## 🚀 Stack

**Frontend:** React 19 · Vite · Tailwind v4 · React Router v6 · i18next  
**Backend:** Node.js · Express · MySQL · JWT

---

## 🎮 Modos de Jogo

### ⚽ Classic Quiz
Identifica 788 jogadores da Liga Portugal 24/25 por foto.
- 10s por pergunta | 3 vidas | 2 ajudas (+5s cada)
- Sistema de áudio com mute persistente

### 📊 Stats Battle
Comparações e desafios baseados em estatísticas reais.
- **F2 (80%):** "Quem é mais alto?" — escolher entre 2 jogadores
- **F3 (20%):** "Jogador X tem 180cm ou mais?" — verdadeiro/falso
- Priorização Big 5: Benfica, Porto, Sporting, Braga, Guimarães
- Stats: altura, idade, golos, assistências, rating, cartões

### 🔒 1v1 Online
Coming Soon

---

## ✨ Features

✅ Bilingue (PT/EN) · Dark/Light mode · Leaderboards · Autenticação JWT  
✅ Sistema de som adaptativo · 100% responsivo · Bug reports integrado  
✅ Glassmorphism + animações suaves · Timer progressivo com gradientes

---

## 🗄️ Base de Dados

**788 jogadores ativos** (Liga Portugal 24/25)
- Dificuldade: 26% easy · 22% medium · 52% hard
- Posições: 87 GK · 251 DEF · 219 MID · 231 ATK/FWD

**Tabelas:** `players_ligaportugal2024`, `competitions`, `users`, `scores`, `bug_reports`

---

## 🔧 Tech Highlights

- Tailwind v4 com config inline (`@theme`)
- Priorização Big 5 via SQL (ORDER BY CASE)
- Fallbacks automáticos de dificuldade
- Sistema multi-competição dinâmico
- Bug report system (user/page/browser tracking)

---

## 📋 To-Do

- [ ] Lazy loading (React.lazy)
- [ ] Placeholder 1v1
- [ ] Liga Brasileira (scraping + BD)
- [ ] Premier League (scraping + BD)
- [ ] A11y básico
- [ ] SEO (meta tags, Open Graph)
- [ ] PWA setup

---

## 🚀 Roadmap

**Novos Modos:** Results Quiz · Daily Challenge  
**Conteúdo:** Champions League · Épocas históricas  
**Social:** 1v1 real-time · Friends   
**Gamificação:** Achievements · XP/Levels · Profile




**Última atualização:** 25 Fevereiro 2025