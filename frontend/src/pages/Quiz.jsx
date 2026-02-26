import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getQuestion, saveScore, getCompetition } from '../services/api';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import EndGame from '../components/EndGame';
countries.registerLocale(en);

function Quiz({ token}) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [showTimeBonus, setShowTimeBonus] = useState(false);
    const [selectedSeason] = useState(() => {
        return localStorage.getItem('selectedSeason') || 'ligaportugal2024';
    });
    const [currentCompetition, setCurrentCompetition] = useState(null);
    const [question, setQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(10);
    const [timerExpired, setTimerExpired] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [usedPlayerIds, setUsedPlayerIds] = useState([]);
    const [scoreSaved, setScoreSaved] = useState(null);
    const [isMuted, setIsMuted] = useState(() => {
        const saved = localStorage.getItem('quizMuted');
        return saved === 'true';
    });

    const [helpsLeft, setHelpsLeft] = useState(2);
    const [usedHelps, setUsedHelps] = useState({ nationality: false, team: false });
    const [activeHelp, setActiveHelp] = useState(null);

    // Audio refs
    const correctSoundRef = useRef(null);
    const wrongSoundRef = useRef(null);
    const urgentSoundRef = useRef(null);


    useEffect(() => {
        localStorage.setItem('quizMuted', isMuted);
    }, [isMuted]);

    useEffect(() => {
        correctSoundRef.current = new Audio('/sounds/correct.mp3');
        correctSoundRef.current.volume = 0.1;
        
        wrongSoundRef.current = new Audio('/sounds/wrong.mp3');
        wrongSoundRef.current.volume = 0.1;
        
        urgentSoundRef.current = new Audio('/sounds/urgent.mp3');
        urgentSoundRef.current.volume = 0.1;

    }, []);

    const stopUrgentSound = () => {
        if (urgentSoundRef.current) {
            urgentSoundRef.current.pause();
            urgentSoundRef.current.currentTime = 0;
        }
    };

    const loadQuestion = async () => {
        stopUrgentSound();
        setLoading(true);
        setSelectedAnswer(null);
        setActiveHelp(null);
        setTimeLeft(10);
        setTimerExpired(false);
        try {
            const data = await getQuestion(usedPlayerIds, selectedSeason);
            setQuestion(data);
            setUsedPlayerIds([...usedPlayerIds, data.id]);
        } catch (error) {
            console.error('Erro ao carregar pergunta:', error);
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
                console.error('Erro ao buscar competição:', error);
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
            console.log('🎯 Enviando score:', {
                score,
                mode: 'classic', // ou 'stats'
                token: token.substring(0, 20) + '...',
                competition: selectedSeason
            });
            
            saveScore(score, 'classic', token, selectedSeason)
                .then(res => {
                    console.log('✅ Resposta:', res);
                    if (res.isNewRecord) setScoreSaved('record');
                    else setScoreSaved('exists');
                })
                .catch((err) => {
                    console.error('❌ ERRO completo:', err);
                    console.error('❌ Resposta do servidor:', err.response?.data);
                    setScoreSaved('error');
                });
        }
    }, [gameOver, score, token, scoreSaved, selectedSeason]);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if (!gameOver && gameStarted) {
            loadQuestion();
        }
    }, [gameStarted]);

    useEffect(() => {
        if (gameOver || selectedAnswer !== null || !question || !gameStarted || timerExpired) return;

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
    }, [gameOver, selectedAnswer, question, gameStarted, timeLeft, timerExpired, isMuted]);




    const handleAnswer = (answer) => {
        stopUrgentSound();
        setSelectedAnswer(answer);
        
        if (answer === question.correctAnswer) {
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
    };

    const useHelp = () => {
        if (helpsLeft === 0) return;

        const availableHelps = [];
        if (!usedHelps.nationality) availableHelps.push('nationality');
        if (!usedHelps.team) availableHelps.push('team');

        if (availableHelps.length === 0) return;

        const randomHelp = availableHelps[Math.floor(Math.random() * availableHelps.length)];
        
        setActiveHelp(randomHelp);
        setUsedHelps({ ...usedHelps, [randomHelp]: true });
        setHelpsLeft(helpsLeft - 1);
        setTimeLeft(prev => prev + 5);
        
        setShowTimeBonus(true);
        setTimeout(() => setShowTimeBonus(false), 2000);
    };

    const resetGame = () => {
        setScore(0);
        setLives(3);
        setTimeLeft(10);
        setTimerExpired(false);
        setGameOver(false);
        setGameStarted(false);
        setSelectedAnswer(null);
        setUsedPlayerIds([]);
        setHelpsLeft(2);
        setUsedHelps({ nationality: false, team: false });
        setActiveHelp(null);
        setScoreSaved(null);
    };

    const getCountryCode = (countryName) => {
        const exceptions = {
            'England': 'gb-eng',
            'USA': 'us',
            'Korea Republic': 'kr',
        };
        if (exceptions[countryName]) return exceptions[countryName];
        const code = countries.getAlpha2Code(countryName, 'en');
        return code ? code.toLowerCase() : 'un';
    };

    const getTimerColor = () => {
        const percentage = (timeLeft / 10) * 100;
        if (percentage > 75) return 'from-green-500 to-green-400';
        if (percentage > 50) return 'from-yellow-500 to-yellow-400';
        if (percentage > 25) return 'from-orange-500 to-orange-400';
        return 'from-red-500 to-red-400';
    };

    const getTimerGlow = () => {
        const percentage = (timeLeft / 10) * 100;
        if (percentage > 75) return 'shadow-[0_0_20px_rgba(34,197,94,0.5)]';
        if (percentage > 50) return 'shadow-[0_0_20px_rgba(234,179,8,0.5)]';
        if (percentage > 25) return 'shadow-[0_0_20px_rgba(249,115,22,0.5)]';
        return 'shadow-[0_0_20px_rgba(239,68,68,0.6)]';
    };



    if (gameOver) {
        return <EndGame
            score={score}
            mode="classic"
            token={token}
            scoreSaved={scoreSaved}
            isMuted={isMuted}
            onPlayAgain={resetGame}
            t={t}
        />;
    }

    if (loading || !question) {
        return (
            <div className="min-h-screen flex items-center justify-center page-transition">
                <div className="text-center space-y-4">
                    <div className="text-6xl animate-bounce">⚽</div>
                    <p className="text-xl font-bold text-foreground">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div key={question.id} className="min-h-screen flex items-center justify-center p-4 page-transition animate-in fade-in slide-in-from-top duration-300">
            <Card className="w-full max-w-lg p-6 md:p-8 space-y-5 dark:bg-card/40 bg-card/12 border-0">
                
                <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        {currentCompetition && (
                            <>
                                <img src={currentCompetition.logo} alt={currentCompetition.name} className="w-8 h-8 object-contain" />
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">{currentCompetition.name}</h3>
                                </div>
                            </>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                        <span className="text-sm font-semibold dark:text-muted-foreground text-foreground">{t('quiz.score') || 'Pontuação'}</span>
                        <span className="text-xl font-black text-primary">{score}</span>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-[280px] aspect-square border-2 border-primary rounded-3xl">
                    <img 
                        src={question.photo} 
                        alt={t('quiz.playerPhoto')}
                        className="w-full h-full object-cover rounded-2xl shadow-lg"
                    />

                    {activeHelp === 'nationality' && (
                        <div className="absolute top-3 right-3 rounded-xl animate-in fade-in zoom-in duration-300">
                            <img 
                                src={`https://flagcdn.com/48x36/${getCountryCode(question.nationality)}.png`}
                                alt=""
                                aria-hidden="true"
                                className="w-12 h-9 object-contain"
                            />
                        </div>
                    )}
                    
                    {activeHelp === 'team' && question.team_logo && (
                        <div className="absolute top-3 right-3 rounded-xl animate-in fade-in zoom-in duration-300">
                            <img 
                                src={question.team_logo} 
                                alt=""
                                aria-hidden="true"
                                className="w-16 h-16 object-contain"
                            />
                        </div>
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
                        <div className="relative w-full h-7 bg-gradient-to-r from-border/20 to-border/40 rounded-full overflow-hidden shadow-inner ">
                            <div 
                                className={`h-full relative bg-gradient-to-r ${getTimerColor()} ${getTimerGlow()}`}
                                style={{ 
                                    width: `${(timeLeft / 10) * 100}%`,
                                    transition: 'width 1s linear'
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
                            ⏰ {t('quiz.timeUp') || 'TEMPO ESGOTADO!'}
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <div className="flex gap-1" role="status" aria-label={`${lives} ${t('quiz.livesRemaining')}`}>
                        {[...Array(3)].map((_, i) => (
                            <span 
                                key={i}
                                aria-hidden="true"
                                className={`text-2xl inline-block transition-all duration-300 ${
                                    i < lives 
                                        ? 'scale-100' 
                                        : 'scale-75 opacity-30 grayscale'
                                }`}
                            >
                                ⚽
                            </span>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            aria-label={isMuted ? t('quiz.unmute') : t('quiz.mute')}
                            aria-pressed={isMuted}
                            className="relative transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                        >
                            <div className="text-3xl" aria-hidden="true">
                                {isMuted ? '🔇' : '🔊'}
                            </div>
                        </button>

                        <button
                            onClick={useHelp}
                            disabled={helpsLeft === 0}
                            aria-label={`${t('quiz.useHelp')} (${helpsLeft} ${t('quiz.remaining')})`}
                            aria-disabled={helpsLeft === 0}
                            className={`relative transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded-lg ${
                                helpsLeft === 0 
                                    ? 'opacity-30 cursor-not-allowed scale-90' 
                                    : 'hover:scale-110 active:scale-95'
                            }`}
                        >
                            <div className="text-4xl" aria-hidden="true">❓</div>
                            {helpsLeft > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-background flex items-center justify-center text-xs font-black" aria-hidden="true">
                                    {helpsLeft}
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    {question.options.map((option) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === question.correctAnswer;
                        const showResult = selectedAnswer !== null;
                        
                        return (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                disabled={selectedAnswer !== null}
                                aria-label={`${t('quiz.selectAnswer')}: ${option}`}
                                aria-pressed={isSelected}
                                className={`
                                    w-full px-5 py-3 rounded-xl font-semibold text-base
                                    transition-all duration-300
                                    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                                    ${!showResult
                                        ? 'dark:bg-card bg-card/45 border-primary border-1 hover:bg-primary hover:scale-[1.05] active:scale-[0.99] shadow dark:text-foreground text-primary-foreground/90'
                                        : isSelected
                                            ? isCorrect
                                                ? 'bg-success text-white scale-[1.02] shadow-lg'
                                                : 'bg-destructive text-white scale-[0.98] shadow-lg'
                                            : 'bg-card/30 opacity-50 text-foreground/50'
                                    }
                                `}
                            >
                                <span className="flex items-center justify-between">
                                    <span>{option}</span>
                                    {showResult && isSelected && (
                                        <span className="text-xl">
                                            {isCorrect ? '✓' : '✗'}
                                        </span>
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => { resetGame(); navigate('/'); }}
                        aria-label={t('quiz.abandon')}
                        className="px-5 py-2 rounded-full border-primary bg-primary/80 text-primary-foreground hover:text-destructive text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        {t('quiz.abandon')}
                    </button>
                </div>
            </Card>
        </div>
    );
}

export default Quiz;