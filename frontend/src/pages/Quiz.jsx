import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getQuestion, saveScore, getCompetition } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import SeasonSelector from '../components/SeasonSelector';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
countries.registerLocale(en);

function Quiz({ token, user, onLogin }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const [selectedSeason, setSelectedSeason] = useState('ligaportugal2024');
    const [currentCompetition, setCurrentCompetition] = useState(null);
    const [difficulty, setDifficulty] = useState('easy');
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
    
    const [helpsLeft, setHelpsLeft] = useState(2);
    const [usedHelps, setUsedHelps] = useState({ nationality: false, team: false });
    const [activeHelp, setActiveHelp] = useState(null);

    // Audio refs
    const correctSoundRef = useRef(null);
    const wrongSoundRef = useRef(null);
    const urgentSoundRef = useRef(null);

    useEffect(() => {
        // Initialize audio with real files
        correctSoundRef.current = new Audio('/sounds/correct.mp3');
        wrongSoundRef.current = new Audio('/sounds/wrong.mp3');
        urgentSoundRef.current = new Audio('/sounds/urgent.mp3');
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
        if (gameOver && token && scoreSaved === null) {
            saveScore(score, 'classic', token, difficulty, selectedSeason)
                .then(res => {
                    if (res.isNewRecord) setScoreSaved('record');
                    else setScoreSaved('exists');
                })
                .catch(() => setScoreSaved('error'));
        }
    }, [gameOver]);

    useEffect(() => {
        if (!gameOver && gameStarted) {
            loadQuestion();
        }
    }, [gameStarted]);

    useEffect(() => {
        if (gameOver || selectedAnswer !== null || !question || !gameStarted || timerExpired) return;

        // Play urgent sound when timer is low
        if (timeLeft === 3 && urgentSoundRef.current) {
            urgentSoundRef.current.currentTime = 0;
            urgentSoundRef.current.play().catch(() => {});
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) { // Mudado de <= 1 para <= 0
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameOver, selectedAnswer, question, gameStarted, timeLeft, timerExpired]);

    const loadQuestion = async () => {
        setLoading(true);
        setSelectedAnswer(null);
        setActiveHelp(null);
        setTimeLeft(10);
        setTimerExpired(false);
        try {
            const data = await getQuestion(difficulty, usedPlayerIds, selectedSeason);
            setQuestion(data);
            setUsedPlayerIds([...usedPlayerIds, data.id]);
        } catch (error) {
            console.error('Erro ao carregar pergunta:', error);
        }
        setLoading(false);
    };

    const handleTimeout = () => {
        setTimerExpired(true);
        
        if (wrongSoundRef.current) {
            wrongSoundRef.current.currentTime = 0;
            wrongSoundRef.current.play().catch(() => {});
        }
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
            setTimeout(() => setGameOver(true), 2000);
        } else {
            setTimeout(() => loadQuestion(), 2500); // Mudado de 2000 para 2500 - dá mais tempo para ver a mensagem
        }
    };

    const handleAnswer = (answer) => {
        setSelectedAnswer(answer);
        
        if (answer === question.correctAnswer) {
            if (correctSoundRef.current) {
                correctSoundRef.current.currentTime = 0;
                correctSoundRef.current.play().catch(() => {});
            }
            setScore(score + 1);
            setTimeout(() => loadQuestion(), 2000);
        } else {
            if (wrongSoundRef.current) {
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
        setHelpsLeft(2);
        setUsedHelps({ nationality: false, team: false });
        setActiveHelp(null);
        setScoreSaved(null);
    };

    const changeDifficulty = (newDifficulty) => {
        setDifficulty(newDifficulty);
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

    const difficultyLabel = (d) => {
        if (d === 'easy') return t('quiz.easy');
        if (d === 'medium') return t('quiz.medium');
        return t('quiz.hard');
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

                    {/* Difficulty Selector */}
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <h2 className="text-xl md:text-2xl font-black text-primary">
                            {t('quiz.selectDifficulty')}
                        </h2>
                        
                        <div className="inline-flex p-1 bg-muted/50 dark:bg-muted rounded-full relative">
                            {/* Sliding background */}
                            <div 
                                className="absolute top-1 bottom-1 bg-primary rounded-full transition-all duration-300 ease-out"
                                style={{
                                    left: difficulty === 'easy' ? '0.25rem' : difficulty === 'medium' ? 'calc(33.333% + 0.083rem)' : 'calc(66.666% - 0.083rem)',
                                    width: 'calc(33.333% - 0.166rem)'
                                }}
                            />
                            
                            {/* Buttons */}
                            {['easy', 'medium', 'hard'].map((diff) => (
                                <button
                                    key={diff}
                                    onClick={() => changeDifficulty(diff)}
                                    className={`
                                        relative z-10 px-8 md:px-12 py-3 md:py-4 rounded-full font-bold text-sm md:text-base
                                        transition-all duration-300
                                        ${difficulty === diff
                                            ? 'text-background'
                                            : 'text-foreground hover:text-foreground/80'
                                        }
                                    `}
                                >
                                    {t(`quiz.${diff}`)}
                                </button>
                            ))}
                        </div>

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
            <div className="min-h-screen flex items-center justify-center p-4 page-transition">
                <Card className="max-w-md w-full p-8 text-center space-y-6">
                    <h1 className="text-4xl font-bold text-foreground">{t('gameOver.title')}</h1>
                    <p className="text-6xl font-bold text-primary">{score}</p>
                    <p className="text-muted-foreground">
                        {t('gameOver.difficulty')} {difficultyLabel(difficulty)}
                    </p>

                    {token ? (
                        <div className="text-sm">
                            {scoreSaved === null && <p className="text-muted-foreground">{t('quiz.saving')}</p>}
                            {scoreSaved === 'record' && <p className="text-success font-bold">{t('quiz.newRecord')}</p>}
                            {scoreSaved === 'exists' && <p className="text-muted-foreground">{t('quiz.betterScore')}</p>}
                            {scoreSaved === 'error' && <p className="text-destructive">{t('quiz.saveError')}</p>}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            <button 
                                className="underline text-foreground hover:text-primary transition-colors" 
                                onClick={() => navigate('/login?mode=register&redirect=/quiz')}
                            >
                                {t('quiz.registerLink')}
                            </button>{' '}
                            {t('quiz.registerPrompt')}
                        </p>
                    )}

                    <div className="space-y-3">
                        <Button size="lg" className="w-full" onClick={resetGame}>
                            {t('gameOver.playAgain')}
                        </Button>
                        <Button variant="ghost" className="w-full text-foreground" onClick={() => navigate('/')}>
                            {t('gameOver.backHome')}
                        </Button>
                    </div>
                </Card>
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
                                    <p className="text-xs text-muted-foreground">{difficultyLabel(difficulty)}</p>
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

                {/* Player Photo */}
                <div className="relative mx-auto w-full max-w-[280px] aspect-square border-2 border-primary rounded-3xl">
                    <img 
                        src={question.photo} 
                        alt="Jogador" 
                        className="w-full h-full object-cover rounded-2xl shadow-lg"
                    />

                    {/* Helps Overlay */}
                    {activeHelp === 'nationality' && (
                        <div className="absolute top-3 right-3 rounded-xl animate-in fade-in zoom-in duration-300">
                            <img 
                                src={`https://flagcdn.com/48x36/${getCountryCode(question.nationality)}.png`}
                                alt={question.nationality}
                                className="w-12 h-9 object-contain"
                            />
                        </div>
                    )}
                    
                    {activeHelp === 'team' && question.team_logo && (
                        <div className="absolute top-3 right-3 rounded-xl animate-in fade-in zoom-in duration-300">
                            <img 
                                src={question.team_logo} 
                                alt="Logo equipa" 
                                className="w-16 h-16 object-contain"
                            />
                        </div>
                    )}
                </div>

                {/* Timer Bar - Directly below image */}
                {!timerExpired ? (
                    <div className="relative w-full h-7 bg-gradient-to-r from-border/20 to-border/40 rounded-full overflow-hidden shadow-inner ">
                        {/* Barra principal com gradiente animado */}
                        <div 
                            className={`h-full relative bg-gradient-to-r ${getTimerColor()} ${getTimerGlow()}`}
                            style={{ 
                                width: `${(timeLeft / 10) * 100}%`,
                                transition: 'width 1s linear'
                            }}
                        >
                            {/* Brilho superior */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
                            
                            {/* Brilho lateral animado */}
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/40 to-transparent" />
                        </div>
                        
                        {/* Efeito de perigo quando tempo baixo */}
                        {timeLeft <= 2 && (
                            <div className="absolute inset-0 bg-red-500/20 animate-pulse rounded-full" />
                        )}
                        
                        {/* Reflexo de vidro */}
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-full pointer-events-none" />
                    </div>
                ) : (
                    // Mensagem FORTE quando acaba
                    <div className="relative w-full h-8 bg-gradient-to-r from-orange-600/40 to-red-600/40 rounded-2xl overflow-hidden shadow-2xl border-2 border-orange-500/60 flex items-center justify-center">
                        {/* Efeito de pulsação forte */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-red-500/30 animate-pulse" />
                        
                        {/* Ondas expansivas */}
                        <div className="absolute inset-0 animate-ping bg-red-500/20 rounded-2xl" />
                        
                        {/* Texto GRANDE e forte */}
                        <span className="relative z-10 text-base md:text-lg font-black text-orange-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wide animate-bounce">
                            ⏰ {t('quiz.timeUp') || 'TEMPO ESGOTADO!'}
                        </span>
                    </div>
                )}

                {/* Lives & Help */}
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

                {/* Answer Options */}
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
                                className={`
                                    w-full px-5 py-3 rounded-xl font-semibold text-base
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

                {/* Abandon Button */}
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => { resetGame(); navigate('/'); }}
                        className="px-5 py-2 rounded-full border border-destructive/40 text-destructive text-xs font-semibold hover:bg-destructive/10 transition-all"
                    >
                        {t('quiz.abandon')}
                    </button>
                </div>
            </Card>
        </div>
    );
}

export default Quiz;