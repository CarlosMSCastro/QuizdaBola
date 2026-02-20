import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getQuestion, saveScore } from '../services/api';
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
    const [difficulty, setDifficulty] = useState('easy');
    const [question, setQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(8);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [usedPlayerIds, setUsedPlayerIds] = useState([]);
    const [scoreSaved, setScoreSaved] = useState(null);
    
    const [helpsLeft, setHelpsLeft] = useState(2);
    const [usedHelps, setUsedHelps] = useState({ nationality: false, team: false });
    const [activeHelp, setActiveHelp] = useState(null);

    useEffect(() => {
        if (gameOver && token && scoreSaved === null) {
            saveScore(score, 'classic', token, difficulty)
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
        if (gameOver || selectedAnswer !== null || !question || !gameStarted) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleTimeout();
                    return 8;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameOver, selectedAnswer, question, gameStarted]);

    const loadQuestion = async () => {
        setLoading(true);
        setSelectedAnswer(null);
        setActiveHelp(null);
        setTimeLeft(8);
        try {
            const data = await getQuestion(difficulty, usedPlayerIds);
            setQuestion(data);
            setUsedPlayerIds([...usedPlayerIds, data.id]);
        } catch (error) {
            console.error('Erro ao carregar pergunta:', error);
        }
        setLoading(false);
    };

    const handleTimeout = () => {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
            setGameOver(true);
        } else {
            setTimeout(() => loadQuestion(), 1000);
        }
    };

    const handleAnswer = (answer) => {
        setSelectedAnswer(answer);
        
        if (answer === question.correctAnswer) {
            setScore(score + 1);
            setTimeout(() => loadQuestion(), 1500);
        } else {
            const newLives = lives - 1;
            setLives(newLives);
            if (newLives <= 0) {
                setTimeout(() => setGameOver(true), 1500);
            } else {
                setTimeout(() => loadQuestion(), 1500);
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
        setTimeLeft(8);
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

    const difficultyEmoji = (d) => {
        if (d === 'easy') return '😊';
        if (d === 'medium') return '😐';
        return '😈';
    };

    if (!gameStarted && !gameOver) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-4xl w-full space-y-10">
                    
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 rounded-full border-2 border-primary text-foreground font-bold text-sm uppercase tracking-widest hover:bg-primary hover:text-background transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
                    >
                        ← Voltar
                    </button>

                    {/* Season Selector */}
                    <SeasonSelector 
                        selectedSeason={selectedSeason}
                        onSeasonChange={setSelectedSeason}
                    />

                    {/* Difficulty Selector */}
                    <div className="max-w-xl mx-auto text-center space-y-6">
                        <h2 className="text-2xl font-bold text-primary">
                            {t('quiz.selectDifficulty')}
                        </h2>
                        
                        <div className="flex gap-3 justify-center">
                            {['easy', 'medium', 'hard'].map((diff) => (
                                <button
                                    key={diff}
                                    onClick={() => changeDifficulty(diff)}
                                    className={`
                                        flex flex-col items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-wide
                                        transition-all duration-300
                                        ${difficulty === diff
                                            ? 'bg-primary text-background scale-110 shadow-2xl'
                                            : 'bg-muted/50 text-foreground hover:bg-muted hover:scale-105'
                                        }
                                    `}
                                >
                                    <span className="text-3xl">{difficultyEmoji(diff)}</span>
                                    <span>{t(`quiz.${diff}`)}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={startGame}
                            className="px-12 py-4 rounded-full bg-primary text-background font-bold text-lg uppercase tracking-widest hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
                        >
                            {t('quiz.start')} →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameOver) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-6xl animate-bounce">⚽</div>
                    <p className="text-xl font-bold text-foreground">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-6xl">❌</div>
                    <p className="text-xl font-bold text-foreground">{t('common.error')}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 rounded-full border-2 border-primary text-foreground font-bold text-sm uppercase tracking-widest hover:bg-primary hover:text-background transition-all duration-200"
                    >
                        ← Voltar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Timer Bar - FIRST */}
                <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ease-linear ${
                            timeLeft <= 2 
                                ? 'bg-destructive animate-pulse' 
                                : timeLeft <= 4 
                                    ? 'bg-orange-500' 
                                    : 'bg-primary'
                        }`}
                        style={{ width: `${(timeLeft / 8) * 100}%` }}
                    />
                    {timeLeft <= 2 && (
                        <div className="absolute inset-0 bg-destructive/20 animate-ping" />
                    )}
                </div>

                {/* Main Card */}
                <div className={`relative transition-all duration-300 ${
                    timeLeft <= 2 ? 'animate-shake' : ''
                }`}>
                    
                    {/* Player Photo - SECOND */}
                    <div className="relative mx-auto w-full max-w-sm aspect-square mb-4">
                        <img 
                            src={question.photo} 
                            alt="Jogador" 
                            className="w-full h-full object-cover rounded-3xl shadow-2xl"
                        />
                        
                        {/* Vignette effect when time is low */}
                        {timeLeft <= 2 && (
                            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-destructive/30 rounded-3xl animate-pulse pointer-events-none" />
                        )}

                        {/* Helps Overlay - On top of image */}
                        {activeHelp === 'nationality' && (
                            <div className="absolute top-4 right-4 rounded-2xl bg-card/90 backdrop-blur-md p-3 shadow-2xl animate-in fade-in zoom-in duration-300">
                                <img 
                                    src={`https://flagcdn.com/48x36/${getCountryCode(question.nationality)}.png`}
                                    alt={question.nationality}
                                    className="w-16 h-12 object-contain"
                                />
                            </div>
                        )}
                        
                        {activeHelp === 'team' && question.team_logo && (
                            <div className="absolute top-4 right-4 rounded-2xl bg-card/90 backdrop-blur-md p-3 shadow-2xl animate-in fade-in zoom-in duration-300">
                                <img 
                                    src={question.team_logo} 
                                    alt="Logo equipa" 
                                    className="w-20 h-20 object-contain"
                                />
                            </div>
                        )}
                    </div>

                    {/* Stats Bar - THIRD (Lives, Help, Score) */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                {[...Array(3)].map((_, i) => (
                                    <span 
                                        key={i} 
                                        className={`text-3xl transition-all duration-300 ${
                                            i < lives ? 'scale-100' : 'scale-75 opacity-30'
                                        }`}
                                    >
                                        {i < lives ? '❤️' : '🖤'}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* Help Button */}
                            <button
                                onClick={useHelp}
                                disabled={helpsLeft === 0}
                                className={`relative transition-all ${
                                    helpsLeft === 0 
                                        ? 'opacity-30 cursor-not-allowed scale-90' 
                                        : 'hover:scale-110 active:scale-95'
                                }`}
                            >
                                <div className="text-5xl">💡</div>
                                {helpsLeft > 0 && (
                                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-background flex items-center justify-center text-xs font-black">
                                        {helpsLeft}
                                    </div>
                                )}
                            </button>

                            {/* Score */}
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm">
                                <span className="text-2xl">⭐</span>
                                <span className="text-2xl font-black text-primary">{score}</span>
                            </div>
                        </div>
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-3">
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
                                        w-full px-6 py-4 rounded-2xl font-bold text-lg
                                        transition-all duration-300 relative overflow-hidden
                                        ${!showResult
                                            ? 'bg-card hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                                            : isSelected
                                                ? isCorrect
                                                    ? 'bg-green-500 text-white scale-105 shadow-2xl'
                                                    : 'bg-destructive text-white scale-95'
                                                : isCorrect && showResult
                                                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                                    : 'bg-card/50 opacity-50'
                                        }
                                    `}
                                >
                                    <span className="relative z-10 flex items-center justify-between">
                                        <span>{option}</span>
                                        {showResult && isSelected && (
                                            <span className="text-2xl">
                                                {isCorrect ? '✓' : '✗'}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Abandon Button */}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => { resetGame(); navigate('/'); }}
                        className="px-6 py-2 rounded-full border border-destructive/50 text-destructive font-semibold text-sm hover:bg-destructive/10 transition-all"
                    >
                        {t('quiz.abandon')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Quiz;