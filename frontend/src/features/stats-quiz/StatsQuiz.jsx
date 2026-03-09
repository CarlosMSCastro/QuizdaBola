import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  getStatsQuestion,
  saveScore,
  getCompetition,
} from "../../shared/services/api";
import { Card } from "@/shared/components/ui/card";
import { useNavigate } from "react-router-dom";
import EndGame from "../../shared/components/EndGame";

function StatsQuizSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 page-transition animate-in fade-in duration-500">
      <Card className="w-full max-w-lg p-6 md:p-8 space-y-5 dark:bg-card/40 bg-card/12 border-0">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted-foreground/20 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-muted-foreground/20 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
            <div className="h-4 w-20 bg-muted-foreground/20 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="text-center py-2">
          <div className="h-6 md:h-7 w-3/4 mx-auto bg-muted-foreground/20 rounded animate-pulse"></div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden bg-muted-foreground/10 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="w-full h-48 bg-muted-foreground/20"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted-foreground/20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full h-7 bg-gradient-to-r from-border/20 to-border/40 rounded-full overflow-hidden animate-pulse"></div>

        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-6 h-6 bg-muted-foreground/20 rounded-full animate-pulse"></div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-muted-foreground/20 rounded-lg animate-pulse"></div>
            <div className="w-12 h-12 bg-muted-foreground/20 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-40 h-10 bg-muted-foreground/20 rounded-full animate-pulse"></div>
        </div>
      </Card>
    </div>
  );
}

function StatsQuiz({ token }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "pt" ? "pt" : "en";

  const [showTimeBonus, setShowTimeBonus] = useState(false);
  const [selectedSeason] = useState(() => {
    return localStorage.getItem("selectedSeason") || "ligaportugal2024";
  });
  const [currentCompetition, setCurrentCompetition] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerExpired, setTimerExpired] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(null);
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("statsQuizMuted");
    return saved === "true";
  });

  const [helpsLeft, setHelpsLeft] = useState(2);
  const [helpUsed, setHelpUsed] = useState(false);
  const [revealedPlayerId, setRevealedPlayerId] = useState(null);
  const [activeHint, setActiveHint] = useState(null);

  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const urgentSoundRef = useRef(null);
  const usedPlayerIdsRef = useRef([]);

  const stopUrgentSound = () => {
    if (urgentSoundRef.current) {
      urgentSoundRef.current.pause();
      urgentSoundRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    localStorage.setItem("statsQuizMuted", isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (isMuted) {
      stopUrgentSound();
    }
  }, [isMuted]);

  useEffect(() => {
    correctSoundRef.current = new Audio("/sounds/correct.mp3");
    correctSoundRef.current.volume = 0.1;

    wrongSoundRef.current = new Audio("/sounds/wrong.mp3");
    wrongSoundRef.current.volume = 0.1;

    urgentSoundRef.current = new Audio("/sounds/urgent.mp3");
    urgentSoundRef.current.volume = 0.1;
  }, []);

  const loadQuestion = async () => {
    console.log("🔍 usedPlayerIdsRef:", usedPlayerIdsRef.current);
    stopUrgentSound();
    setLoading(true);
    setSelectedAnswer(null);
    setRevealed(false);
    setHelpUsed(false);
    setRevealedPlayerId(null);
    setActiveHint(null);
    setTimeLeft(10);
    setTimerExpired(false);
    try {
      const data = await getStatsQuestion(usedPlayerIdsRef.current, selectedSeason);
      setQuestion(data);
      const ids = data.players.map((p) => p.id);
      usedPlayerIdsRef.current = [...usedPlayerIdsRef.current, ...ids];
    } catch (error) {
      console.error("Erro ao carregar pergunta:", error);
    }
    setLoading(false);
  };

  const handleTimeout = () => {
    stopUrgentSound();
    setTimerExpired(true);

    if (wrongSoundRef.current && !isMuted) {
      wrongSoundRef.current.currentTime = 0;
      wrongSoundRef.current.play().catch(() => {});
    }
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) {
      setTimeout(() => setGameOver(true), 2000);
    } else {
      setTimeout(() => loadQuestion(), 2500);
    }
  };

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const data = await getCompetition(selectedSeason);
        setCurrentCompetition(data);
      } catch (error) {
        console.error("Erro ao buscar competição:", error);
      }
    };

    if (selectedSeason) {
      fetchCompetition();
    }
  }, [selectedSeason]);

  useEffect(() => {
    if (currentCompetition && !gameStarted && !gameOver) {
      setGameStarted(true);
    }
  }, [currentCompetition, gameStarted, gameOver]);

  useEffect(() => {
    if (gameOver && token && scoreSaved === null && score > 0) {
      saveScore(score, "stats", token, selectedSeason)
        .then((res) => {
          if (res.isNewRecord) setScoreSaved("record");
          else setScoreSaved("exists");
        })
        .catch(() => setScoreSaved("error"));
    }
  }, [gameOver, score, token, scoreSaved, selectedSeason]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!gameOver && gameStarted) {
      loadQuestion();
    }
  }, [gameStarted]);

  useEffect(() => {
    const hasNavigatedFromHome = sessionStorage.getItem('quiz-navigation');
    
    if (!hasNavigatedFromHome && gameStarted) {
      navigate('/');
      return;
    }
    
    if (gameStarted) {
      sessionStorage.removeItem('quiz-navigation');
    }
  }, [gameStarted, navigate]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (
      gameOver ||
      selectedAnswer !== null ||
      !question ||
      !gameStarted ||
      timerExpired
    )
      return;

    if (timeLeft === 3 && urgentSoundRef.current && !isMuted) {
      urgentSoundRef.current.currentTime = 0;
      urgentSoundRef.current.play().catch(() => {});
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, selectedAnswer, question, gameStarted, timeLeft, timerExpired]);

  const handleAnswer = (answer) => {
    if (selectedAnswer !== null) return;
    stopUrgentSound();
    setSelectedAnswer(answer);

    const correct = String(answer) === String(question.correctAnswer);

    if (question.format === "F2") {
      setRevealed(true);
      if (correct) {
        if (correctSoundRef.current && !isMuted) {
          correctSoundRef.current.currentTime = 0;
          correctSoundRef.current.play().catch(() => {});
        }
        setScore(score + 1);
        setTimeout(() => loadQuestion(), 2000);
      } else {
        if (wrongSoundRef.current && !isMuted) {
          wrongSoundRef.current.currentTime = 0;
          wrongSoundRef.current.play().catch(() => {});
        }
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          setTimeout(() => setGameOver(true), 2000);
        } else {
          setTimeout(() => loadQuestion(), 2000);
        }
      }
    } else {
      if (correct) {
        if (correctSoundRef.current && !isMuted) {
          correctSoundRef.current.currentTime = 0;
          correctSoundRef.current.play().catch(() => {});
        }
        setScore(score + 1);
        setTimeout(() => loadQuestion(), 2000);
      } else {
        if (wrongSoundRef.current && !isMuted) {
          wrongSoundRef.current.currentTime = 0;
          wrongSoundRef.current.play().catch(() => {});
        }
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          setTimeout(() => setGameOver(true), 2000);
        } else {
          setTimeout(() => loadQuestion(), 2000);
        }
      }
    }
  };

  const useHelp = () => {
    if (helpUsed || helpsLeft === 0 || !question || !question.helpData) return;

    if (question.format === "F2" && question.helpData.type === "reveal") {
      const randomPlayer =
        Math.random() < 0.5
          ? question.helpData.player1_id
          : question.helpData.player2_id;
      setRevealedPlayerId(randomPlayer);
    } else if (question.format === "F3" && question.helpData.type === "hint") {
      setActiveHint({
        type: question.helpData.hint_type,
        value: question.helpData.hint_value,
      });
    }

    setHelpsLeft(helpsLeft - 1);
    setHelpUsed(true);
    setTimeLeft((prev) => prev + 5);
    setShowTimeBonus(true);
    setTimeout(() => setShowTimeBonus(false), 2000);
  };

  const resetGame = () => {
    usedPlayerIdsRef.current = [];
    console.log("🔄 resetGame - ref limpa:", usedPlayerIdsRef.current);
    setScore(0);
    setLives(3);
    setTimeLeft(10);
    setTimerExpired(false);
    setGameOver(false);
    setGameStarted(false);
    setCurrentCompetition(null);
    setSelectedAnswer(null);
    setRevealed(false);
    setHelpsLeft(2);
    setHelpUsed(false);
    setRevealedPlayerId(null);
    setActiveHint(null);
    setScoreSaved(null);
  };

  const getTimerColor = () => {
    const percentage = (timeLeft / 10) * 100;
    if (percentage > 75) return "from-green-500 to-green-400";
    if (percentage > 50) return "from-yellow-500 to-yellow-400";
    if (percentage > 25) return "from-orange-500 to-orange-400";
    return "from-red-500 to-red-400";
  };

  const getTimerGlow = () => {
    const percentage = (timeLeft / 10) * 100;
    if (percentage > 75) return "shadow-[0_0_20px_rgba(34,197,94,0.5)]";
    if (percentage > 50) return "shadow-[0_0_20px_rgba(234,179,8,0.5)]";
    if (percentage > 25) return "shadow-[0_0_20px_rgba(249,115,22,0.5)]";
    return "shadow-[0_0_20px_rgba(239,68,68,0.6)]";
  };

  const formatHintLabel = (type) => {
    const labels = {
      position: lang === "pt" ? "Posição" : "Position",
      nationality: lang === "pt" ? "Nacionalidade" : "Nationality",
      team_name: lang === "pt" ? "Equipa" : "Team",
    };
    return labels[type] || type;
  };

  if (gameOver) {
    return (
      <EndGame
        score={score}
        mode="stats"
        token={token}
        scoreSaved={scoreSaved}
        isMuted={isMuted}
        selectedSeason={selectedSeason}
        currentCompetition={currentCompetition}
        onPlayAgain={resetGame}
        t={t}
      />
    );
  }

  if (loading || !question) {
    return <StatsQuizSkeleton />;
  }

  const questionText =
    lang === "pt" ? question.question_pt : question.question_en;

  return (
    <div
      key={`${question.players[0].id}-${question.format}`}
      className="min-h-screen flex items-center justify-center p-4 page-transition animate-in fade-in slide-in-from-top duration-300"
    >
      <Card className="w-full max-w-lg p-6 md:p-8 space-y-5 dark:bg-card/40 bg-card/12 border-0">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            {currentCompetition && (
              <>
                <img
                  src={currentCompetition.logo}
                  alt={currentCompetition.name}
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {currentCompetition.name}
                  </h3>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
            <span className="text-sm font-semibold dark:text-muted-foreground text-foreground">
              {t("quiz.score") || "Pontuação"}
            </span>
            <span className="text-xl font-black text-primary">{score}</span>
          </div>
        </div>

        <div className="text-center py-2">
          <p className="text-lg md:text-xl font-bold text-primary">
            {questionText}
          </p>
        </div>

        {activeHint && question.format === "F3" && (
          <div className="px-4 py-2 rounded-xl bg-primary/20 border-2 border-primary/40 text-center animate-in fade-in slide-in-from-top duration-300">
            <span className="text-sm md:text-base font-bold text-foreground">
              💡 {formatHintLabel(activeHint.type)}: {activeHint.value}
            </span>
          </div>
        )}

        <div className="space-y-4">
          {question.format === "F2" && (
            <div className="grid grid-cols-2 gap-3">
              {question.players.map((player) => {
                const isCorrect =
                  String(question.correctAnswer) === String(player.id);
                const isSelected = String(selectedAnswer) === String(player.id);
                const shouldRevealHelp =
                  revealedPlayerId === player.id && !selectedAnswer;
                const shouldRevealFinal = revealed;

                return (
                  <button
                    key={player.id}
                    onClick={() => handleAnswer(player.id)}
                    disabled={selectedAnswer !== null}
                    aria-label={`${t("quiz.selectPlayer")}: ${player.name}`}
                    aria-pressed={String(selectedAnswer) === String(player.id)}
                    className={`
                      group rounded-2xl overflow-hidden transition-all duration-300 shadow-lg
                      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                      ${
                        !selectedAnswer
                          ? "hover:scale-105 active:scale-100 dark:bg-card/60 bg-card/50 border-2 border-primary/30 hover:border-primary"
                          : isSelected
                            ? isCorrect
                              ? "scale-105 ring-4 ring-success border-2 border-success"
                              : "scale-95 ring-4 ring-destructive border-2 border-destructive"
                            : isCorrect
                              ? "ring-4 ring-success/50 border-2 border-success/50"
                              : "opacity-50"
                      }
                    `}
                  >
                    <div className="relative">
                      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-b from-muted/50 to-muted">
                        <img
                          src={player.photo}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>

                      {shouldRevealHelp && (
                        <div className="absolute inset-0 bg-primary/50 flex items-center justify-center animate-in fade-in duration-300">
                          <div className="text-center">
                            <span className="text-white text-4xl font-black drop-shadow-2xl">
                              {player.statValue}
                            </span>
                          </div>
                        </div>
                      )}

                      {shouldRevealFinal && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
                          <div className="text-center">
                            <span className="text-white text-5xl font-black drop-shadow-2xl">
                              {player.statValue}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-card/95 backdrop-blur-sm">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <img
                          src={player.team_logo}
                          alt=""
                          aria-hidden="true"
                          className="w-5 h-5 object-contain flex-shrink-0"
                        />
                        <p className="text-sm font-bold dark:text-foreground text-accent truncate">
                          {player.name}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {question.format === "F3" && (
            <>
              <div className="flex flex-col items-center gap-3">
                <div className={`relative w-40 h-40 rounded-2xl overflow-hidden border-3 shadow-lg
                  ${selectedAnswer === null
                    ? "border-primary"
                    : String(selectedAnswer) === String(question.correctAnswer)
                      ? "border-green-500"
                      : "border-red-500"
                  }`}>
                  <img
                    src={question.players[0].photo}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                  />
                  {selectedAnswer !== null && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center animate-in fade-in duration-300">
                      <span className="text-white text-5xl font-black drop-shadow-2xl">
                        {question.players[0].statValue}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={question.players[0].team_logo}
                    alt=""
                    aria-hidden="true"
                    className="w-6 h-6 object-contain"
                  />
                  <p className="font-bold text-base text-foreground">
                    {question.players[0].name}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: lang === "pt" ? "Verdadeiro" : "True", value: true },
                  { label: lang === "pt" ? "Falso" : "False", value: false },
                ].map((opt) => {
                  const isSelected = selectedAnswer === opt.value;
                  const isCorrect = opt.value === question.correctAnswer;
                  const showResult = selectedAnswer !== null;

                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() => handleAnswer(opt.value)}
                      disabled={selectedAnswer !== null}
                      aria-label={`${t("quiz.selectAnswer")}: ${opt.label}`}
                      aria-pressed={selectedAnswer === opt.value}
                      className={`
                        px-5 py-3 rounded-xl font-semibold text-base
                        transition-all duration-300
                        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                        ${
                          !showResult
                            ? "dark:bg-card bg-card/45 border-primary border-1 hover:bg-primary hover:scale-[1.05] active:scale-[0.99] shadow dark:text-foreground text-primary-foreground/90"
                            : isSelected
                              ? isCorrect
                                ? "bg-success text-white scale-[1.02] shadow-lg"
                                : "bg-destructive text-white scale-[0.98] shadow-lg"
                              : "bg-card/30 opacity-50 text-foreground/50"
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {!timerExpired ? (
          showTimeBonus ? (
            <div className="relative w-full h-8 bg-gradient-to-r from-green-600/40 to-emerald-600/40 rounded-2xl overflow-hidden shadow-2xl border-2 border-green-500/60 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30 animate-pulse" />
              <div className="absolute inset-0 animate-ping bg-green-500/20 rounded-2xl" />
              <span className="relative z-10 text-base md:text-lg font-black text-green-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wide animate-bounce">
                ⏱️ +5s
              </span>
            </div>
          ) : (
            <div className="relative w-full h-7 bg-gradient-to-r from-border/20 to-border/40 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full relative bg-gradient-to-r ${getTimerColor()} ${getTimerGlow()}`}
                style={{
                  width: `${(timeLeft / 10) * 100}%`,
                  transition: "width 1s linear",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/40 to-transparent" />
              </div>
              {timeLeft <= 2 && (
                <div className="absolute inset-0 bg-red-500/20 animate-pulse rounded-full" />
              )}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-full pointer-events-none" />
            </div>
          )
        ) : (
          <div className="relative w-full h-8 bg-gradient-to-r from-orange-600/40 to-red-600/40 rounded-2xl overflow-hidden shadow-2xl border-2 border-orange-500/60 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-red-500/30 animate-pulse" />
            <div className="absolute inset-0 animate-ping bg-red-500/20 rounded-2xl" />
            <span className="relative z-10 text-base md:text-lg font-black text-orange-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wide animate-bounce">
              ⏰ {t("quiz.timeUp") || "TEMPO ESGOTADO!"}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div
            className="flex gap-1"
            role="status"
            aria-label={`${lives} ${t("quiz.livesRemaining")}`}
          >
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`text-2xl inline-block transition-all duration-300 ${
                  i < lives ? "scale-100" : "scale-75 opacity-30 grayscale"
                }`}
              >
                ⚽
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? t("quiz.unmute") : t("quiz.mute")}
              aria-pressed={isMuted}
              className="relative transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            >
              <div className="text-3xl" aria-hidden="true">
                {isMuted ? "🔇" : "🔊"}
              </div>
            </button>

            <button
              onClick={useHelp}
              disabled={helpUsed || helpsLeft === 0 || !question.helpData}
              aria-label={`${t("quiz.useHelp")} (${helpsLeft} ${t("quiz.remaining")})`}
              aria-disabled={helpUsed || helpsLeft === 0 || !question.helpData}
              className={`relative transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded-lg ${
                helpUsed || helpsLeft === 0 || !question.helpData
                  ? "opacity-50 cursor-not-allowed scale-90 grayscale"
                  : "hover:scale-110 active:scale-95"
              }`}
            >
              <div className="text-4xl" aria-hidden="true">
                ❓
              </div>
              {helpsLeft > 0 && (
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-background flex items-center justify-center text-xs font-black"
                  aria-hidden="true"
                >
                  {helpsLeft}
                </div>
              )}
            </button>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <button
            onClick={() => {
              stopUrgentSound();
              resetGame();
              navigate("/");
            }}
            aria-label={t("quiz.abandon")}
            className="px-5 py-2 rounded-full border-primary bg-primary/80 text-primary-foreground hover:text-destructive text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {t("quiz.abandon")}
          </button>
        </div>
      </Card>
    </div>
  );
}

export default StatsQuiz;