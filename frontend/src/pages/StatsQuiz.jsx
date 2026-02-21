import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getStatsQuestion, saveScore, getCompetition } from '../services/api';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import SeasonSelector from '../components/SeasonSelector';

function StatsQuiz({ token, user }) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const lang = i18n.language === 'pt' ? 'pt' : 'en';
    
    const [showTimeBonus, setShowTimeBonus] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState('ligaportugal2024');
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
    const [usedPlayerIds, setUsedPlayerIds] = useState([]);
    const [scoreSaved, setScoreSaved] = useState(null);
    const [isMuted, setIsMuted] = useState(() => {
        const saved = localStorage.getItem('statsQuizMuted');
        return saved === 'true';
    });

    const [helpsLeft, setHelpsLeft] = useState(2);
    const [usedHelps, setUsedHelps] = useState({ hint1: false, hint2: false });
    const [activeHelp, setActiveHelp] = useState(null);

    // Audio refs
    const correctSoundRef = useRef(null);
    const wrongSoundRef = useRef(null);
    const urgentSoundRef = useRef(null);

    // Guarda no localStorage sempre que mudar
    useEffect(() => {
        localStorage.setItem('statsQuizMuted', isMuted);
    }, [isMuted]);

    useEffect(() => {
        // Initialize audio with real files
        correctSoundRef.current = new Audio('/sounds/correct.mp3');
        correctSoundRef.current.volume = 0.3;
        
        wrongSoundRef.current = new Audio('/sounds/wrong.mp3');
        wrongSoundRef.current.volume = 0.2;
        
        urgentSoundRef.current = new Audio('/sounds/urgent.mp3');
        urgentSoundRef.current.volume = 0.3;
    }, []);

    useEffect(() => {
        // Buscar dados da competição selecionada
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
        if (gameOver && token && scoreSaved === null && score > 0) {
            saveScore(score, 'stats', token, selectedSeason)
                .then(res => {
                    if (res.isNewRecord) setScoreSaved('record');
                    else setScoreSaved('exists');
                })
                .catch(() => setScoreSaved('error'));
        }
    }, [gameOver, score, token, scoreSaved, selectedSeason]);

    useEffect(() => {
        if (!gameOver && gameStarted) {
            loadQuestion();
        }
    }, [gameStarted]);

    useEffect(() => {
        if (gameOver || selectedAnswer !== null || !question || !gameStarted || timerExpired) return;

        // Play urgent sound when timer is low
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

    const loadQuestion = async () => {
        setLoading(true);
        setSelectedAnswer(null);
        setRevealed(false);
        setActiveHelp(null);
        setTimeLeft(10);
        setTimerExpired(false);
        try {
            const data = await getStatsQuestion(usedPlayerIds, selectedSeason);
            setQuestion(data);
            const ids = data.players.map(p => p.id);
            setUsedPlayerIds([...usedPlayerIds, ...ids]);
        } catch (error) {
            console.error('Erro ao carregar pergunta:', error);
        }
        setLoading(false);
    };

    const handleTimeout = () => {
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

    const handleAnswer = (answer) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(answer);

        const correct = String(answer) === String(question.correctAnswer);

        if (question.format === 'F2') {
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
        if (helpsLeft === 0) return;

        const availableHelps = [];
        if (!usedHelps.hint1) availableHelps.push('hint1');
        if (!usedHelps.hint2) availableHelps.push('hint2');

        if (availableHelps.length === 0) return;

        const randomHelp = availableHelps[Math.floor(Math.random() * availableHelps.length)];
        
        setActiveHelp(randomHelp);
        setUsedHelps({ ...usedHelps, [randomHelp]: true });
        setHelpsLeft(helpsLeft - 1);
        setTimeLeft(prev => prev + 5);
        
        // Mostrar mensagem de +5s
        setShowTimeBonus(true);
        setTimeout(() => setShowTimeBonus(false), 2000);
    };

    const startGame = () => setGameStarted(true);

    const resetGame = () => {
        setScore(0);
        setLives(3);
        setTimeLeft(10);
        setTimerExpired(false);
        setGameOver(false);
        setGameStarted(false);
        setSelectedAnswer(null);
        setUsedPlayerIds([]);
        setRevealed(false);
        setHelpsLeft(2);
        setUsedHelps({ hint1: false, hint2: false });
        setActiveHelp(null);
        setScoreSaved(null);
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

    if (!gameStarted && !gameOver) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 page-transition">
                <div className="max-w-4xl w-full space-y-10">
                    
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 md:p-3 rounded-xl bg-primary hover:scale-105 transition-colors"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>

                    {/* Season Selector */}
                    <SeasonSelector 
                        selectedSeason={selectedSeason}
                        onSeasonChange={setSelectedSeason}
                    />

                    <div className="max-w-2xl mx-auto text-center">
                        <button
                            onClick={startGame}
                            className="px-8 py-3 rounded-full bg-primary text-background font-bold text-lg uppercase tracking-widest hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
                        >
                            {t('quiz.start')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameOver) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 page-transition bg-gradient-to-br from-background via-background to-muted/20">
                <div className="max-w-2xl w-full text-center space-y-8">
                    
                    {/* Game Over Content */}
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-7xl font-black text-primary tracking-tight">
                            {t('gameOver.title') || 'Game Over'}
                        </h1>
                        
                        {/* Score Display */}
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-sm md:text-base text-muted-foreground uppercase tracking-widest">
                                {t('quiz.score') || 'Pontuação'}
                            </span>
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                <p className="relative text-8xl md:text-9xl font-black text-foreground/60 drop-shadow-2xl">
                                    {score}
                                </p>
                            </div>
                        </div>

                        {/* Record Notification - Only if NEW RECORD */}
                        {token && scoreSaved === 'record' && (
                            <div className="animate-in fade-in zoom-in duration-500">
                                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-success/20 border-2 border-success">
                                    <span className="text-3xl">🏆</span>
                                    <span className="text-lg font-bold text-success">
                                        {t('quiz.newRecord') || 'Novo Record!'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Login Prompt for guests */}
                        {!token && (
                            <div className="pt-4">
                                <p className="text-sm md:text-base text-muted-foreground">
                                    <button 
                                        className="underline text-primary hover:text-primary/80 transition-colors font-semibold" 
                                        onClick={() => navigate('/login?mode=register&redirect=/stats-quiz')}
                                    >
                                        {t('quiz.registerLink') || 'Regista-te'}
                                    </button>{' '}
                                    {t('quiz.registerPrompt') || 'para guardar a tua pontuação!'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                        <button
                            onClick={resetGame}
                            className="px-8 py-4 rounded-full bg-primary text-background font-bold text-lg hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
                        >
                            {t('gameOver.playAgain') || 'Jogar Novamente'}
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-4 rounded-full border-2 border-primary text-primary font-bold text-lg hover:bg-primary/10 hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            {t('gameOver.backHome') || 'Voltar ao Início'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center page-transition">
                <div className="text-center space-y-4">
                    <div className="text-6xl animate-bounce">⚽</div>
                    <p className="text-xl font-bold text-foreground">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center page-transition">
                <div className="text-center space-y-4">
                    <div className="text-6xl">❌</div>
                    <p className="text-xl font-bold text-foreground">{t('common.error')}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 md:p-3 rounded-xl bg-primary hover:scale-105 transition-colors"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    const questionText = lang === 'pt' ? question.question_pt : question.question_en;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 page-transition">
            <Card className="w-full max-w-lg p-6 md:p-8 space-y-5 dark:bg-card/40 bg-card/12 border-0">
                
                {/* Header - League Info */}
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
                    
                    {/* Score */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                        <span className="text-sm font-semibold dark:text-muted-foreground text-foreground">{t('quiz.score') || 'Pontuação'}</span>
                        <span className="text-xl font-black text-primary">{score}</span>
                    </div>
                </div>

                {/* Question Text */}
                <div className="text-center py-2">
                    <p className="text-lg md:text-xl font-bold text-primary">
                        {questionText}
                    </p>
                </div>

                {/* Question Content */}
                <div className="space-y-4">
                    {/* F1 — 1 jogador + opções */}
                    {question.format === 'F1' && (
                        <>
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-primary shadow-lg">
                                    <img
                                        src={question.players[0].photo}
                                        alt={question.players[0].name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <img src={question.players[0].team_logo} alt="logo" className="w-6 h-6 object-contain" />
                                    <p className="font-bold text-base text-foreground">{question.players[0].name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {question.options.map(option => {
                                    const isSelected = String(selectedAnswer) === String(option);
                                    const isCorrect = String(option) === String(question.correctAnswer);
                                    const showResult = selectedAnswer !== null;

                                    return (
                                        <button
                                            key={option}
                                            onClick={() => handleAnswer(option)}
                                            disabled={selectedAnswer !== null}
                                            className={`
                                                px-5 py-3 rounded-xl font-semibold text-base
                                                transition-all duration-300
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
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* F2 — 2 jogadores lado a lado */}
                    {question.format === 'F2' && (
                        <div className="grid grid-cols-2 gap-3">
                            {question.players.map(player => {
                                const isCorrect = String(question.correctAnswer) === String(player.id);
                                const isSelected = String(selectedAnswer) === String(player.id);
                                
                                return (
                                    <button
                                        key={player.id}
                                        onClick={() => handleAnswer(player.id)}
                                        disabled={selectedAnswer !== null}
                                        className={`
                                            group rounded-2xl overflow-hidden transition-all duration-300 shadow-lg
                                            ${!selectedAnswer
                                                ? 'hover:scale-105 active:scale-100 dark:bg-card/60 bg-card/50 border-2 border-primary/30 hover:border-primary'
                                                : isSelected
                                                    ? isCorrect
                                                        ? 'scale-105 ring-4 ring-success border-2 border-success'
                                                        : 'scale-95 ring-4 ring-destructive border-2 border-destructive'
                                                    : isCorrect
                                                        ? 'ring-4 ring-success/50 border-2 border-success/50'
                                                        : 'opacity-50'
                                            }
                                        `}
                                    >
                                        <div className="relative">
                                            <div className="relative w-full h-48 overflow-hidden bg-gradient-to-b from-muted/50 to-muted">
                                                <img
                                                    src={player.photo}
                                                    alt={player.name}
                                                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                                                />
                                                {/* Gradiente na base da foto */}
                                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                                            </div>
                                            
                                            {/* Overlay com stat value */}
                                            {revealed && (
                                                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
                                                    <div className="text-center">
                                                        <span className="text-white text-5xl font-black drop-shadow-2xl">
                                                            {player.statValue ?? '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Info do jogador */}
                                        <div className="p-3 bg-card/95 backdrop-blur-sm">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <img src={player.team_logo} alt="logo" className="w-5 h-5 object-contain flex-shrink-0" />
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

                    {/* F3 — True/False */}
                    {question.format === 'F3' && (
                        <>
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-primary shadow-lg">
                                    <img
                                        src={question.players[0].photo}
                                        alt={question.players[0].name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <img src={question.players[0].team_logo} alt="logo" className="w-6 h-6 object-contain" />
                                    <p className="font-bold text-base text-foreground">{question.players[0].name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: lang === 'pt' ? 'Verdadeiro ✓' : 'True ✓', value: true },
                                    { label: lang === 'pt' ? 'Falso ✗' : 'False ✗', value: false }
                                ].map(opt => {
                                    const isSelected = selectedAnswer === opt.value;
                                    const isCorrect = opt.value === question.correctAnswer;
                                    const showResult = selectedAnswer !== null;

                                    return (
                                        <button
                                            key={String(opt.value)}
                                            onClick={() => handleAnswer(opt.value)}
                                            disabled={selectedAnswer !== null}
                                            className={`
                                                px-5 py-3 rounded-xl font-semibold text-base
                                                transition-all duration-300
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
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Timer Bar */}
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

                {/* Lives, Mute & Help */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <span 
                                key={i} 
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
                        {/* Botão Mute */}
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="relative transition-all hover:scale-110 active:scale-95"
                        >
                            <div className="text-4xl">
                                {isMuted ? '🔇' : '🔊'}
                            </div>
                        </button>

                        {/* Botão Help */}
                        <button
                            onClick={useHelp}
                            disabled={helpsLeft === 0}
                            className={`relative transition-all ${
                                helpsLeft === 0 
                                    ? 'opacity-30 cursor-not-allowed scale-90' 
                                    : 'hover:scale-110 active:scale-95'
                            }`}
                        >
                            <div className="text-4xl">❓</div>
                            {helpsLeft > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-background flex items-center justify-center text-xs font-black">
                                    {helpsLeft}
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Abandon Button */}
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => { resetGame(); navigate('/'); }}
                        className="px-5 py-2 rounded-full border-primary bg-primary/80 text-primary-foreground hover:text-destructive text-sm font-semibold transition-all"
                    >
                        {t('quiz.abandon')}
                    </button>
                </div>
            </Card>
        </div>
    );
}

export default StatsQuiz;