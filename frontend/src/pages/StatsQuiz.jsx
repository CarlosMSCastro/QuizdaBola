import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getStatsQuestion, saveScore } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import SeasonSelector from '../components/SeasonSelector';

function StatsQuiz({ token, user, onLogin }) {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const lang = i18n.language === 'pt' ? 'pt' : 'en';

    const [selectedSeason, setSelectedSeason] = useState('ligaportugal2024');
    const [question, setQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [revealed, setRevealed] = useState(false);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(8);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [usedPlayerIds, setUsedPlayerIds] = useState([]);
    const [scoreSaved, setScoreSaved] = useState(null);

    useEffect(() => {
        if (gameOver && token && scoreSaved === null) {
            saveScore(score, 'stats', token)
                .then(res => {
                    if (res.isNewRecord) setScoreSaved('record');
                    else setScoreSaved('exists');
                })
                .catch(() => setScoreSaved('error'));
        }
    }, [gameOver]);

    useEffect(() => {
        if (!gameOver && gameStarted) loadQuestion();
    }, [gameStarted]);

    useEffect(() => {
        if (gameOver || selectedAnswer !== null || !question || !gameStarted) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
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
        setRevealed(false);
        setTimeLeft(8);
        try {
            const data = await getStatsQuestion(usedPlayerIds);
            console.log(data);
            setQuestion(data);
            const ids = data.players.map(p => p.id);
            setUsedPlayerIds(prev => [...prev, ...ids]);
        } catch (error) {
            console.error('Erro ao carregar pergunta:', error);
        }
        setLoading(false);
    };

    const handleTimeout = () => {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) setGameOver(true);
        else setTimeout(() => loadQuestion(), 1000);
    };

    const handleAnswer = (answer) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(answer);

        const correct = String(answer) === String(question.correctAnswer);

        if (question.format === 'F2') {
            setRevealed(true);
            if (correct) setScore(s => s + 1);
            else {
                const newLives = lives - 1;
                setLives(newLives);
                if (newLives <= 0) {
                    setTimeout(() => setGameOver(true), 2000);
                    return;
                }
            }
            setTimeout(() => loadQuestion(), 2000);
        } else {
            if (correct) setScore(s => s + 1);
            else {
                const newLives = lives - 1;
                setLives(newLives);
                if (newLives <= 0) {
                    setTimeout(() => setGameOver(true), 1500);
                    return;
                }
            }
            setTimeout(() => loadQuestion(), 1500);
        }
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
        setRevealed(false);
        setScoreSaved(null);
    };

    // --- ECRÃ INICIAL ---
    if (!gameStarted && !gameOver) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-4xl w-full space-y-10">
                    
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 rounded-full border-2 border-primary text-foreground font-bold text-sm uppercase tracking-widest hover:bg-primary hover:text-background transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
                    >
                        ← {lang === 'pt' ? 'Voltar' : 'Back'}
                    </button>

                    {/* Season Selector */}
                    <SeasonSelector 
                        selectedSeason={selectedSeason}
                        onSeasonChange={setSelectedSeason}
                    />

                    {/* Start Button */}
                    <div className="max-w-xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl font-bold text-primary">
                            Stats Quiz
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            {lang === 'pt'
                                ? 'Testa o teu conhecimento de estatísticas!'
                                : 'Test your statistics knowledge!'}
                        </p>
                        
                        <button
                            onClick={startGame}
                            className="px-12 py-4 rounded-full bg-primary text-background font-bold text-lg uppercase tracking-widest hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
                        >
                            {lang === 'pt' ? 'Começar' : 'Start'} →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- GAME OVER ---
    if (gameOver) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center space-y-6">
                    <h1 className="text-4xl font-bold text-foreground">
                        {lang === 'pt' ? 'Fim de Jogo!' : 'Game Over!'}
                    </h1>
                    <p className="text-6xl font-bold text-primary">{score}</p>

                    {token ? (
                        <div className="text-sm">
                            {scoreSaved === null && <p className="text-muted-foreground">{lang === 'pt' ? 'A guardar...' : 'Saving...'}</p>}
                            {scoreSaved === 'record' && <p className="text-success font-bold">🏆 {lang === 'pt' ? 'Novo record!' : 'New record!'}</p>}
                            {scoreSaved === 'exists' && <p className="text-muted-foreground">{lang === 'pt' ? 'Já tens melhor.' : 'You have better.'}</p>}
                            {scoreSaved === 'error' && <p className="text-destructive">{lang === 'pt' ? 'Erro ao guardar' : 'Error saving'}</p>}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            <button 
                                className="underline text-foreground hover:text-primary transition-colors" 
                                onClick={() => navigate('/login?mode=register&redirect=/stats-quiz')}
                            >
                                {lang === 'pt' ? 'Regista-te' : 'Register'}
                            </button>{' '}
                            {lang === 'pt' ? 'para o leaderboard' : 'for the leaderboard'}
                        </p>
                    )}

                    <div className="space-y-3">
                        <Button size="lg" className="w-full" onClick={resetGame}>
                            {lang === 'pt' ? 'Jogar Novamente' : 'Play Again'}
                        </Button>
                        <Button variant="ghost" className="w-full text-foreground" onClick={() => navigate('/')}>
                            {lang === 'pt' ? 'Voltar ao Início' : 'Back to Home'}
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
                    <p className="text-xl font-bold text-foreground">
                        {lang === 'pt' ? 'A carregar...' : 'Loading...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-6xl">❌</div>
                    <p className="text-xl font-bold text-foreground">
                        {lang === 'pt' ? 'Erro' : 'Error'}
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 rounded-full border-2 border-primary text-foreground font-bold text-sm uppercase tracking-widest hover:bg-primary hover:text-background transition-all duration-200"
                    >
                        ← {lang === 'pt' ? 'Voltar' : 'Back'}
                    </button>
                </div>
            </div>
        );
    }

    const questionText = lang === 'pt' ? question.question_pt : question.question_en;

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

                {/* Main Content */}
                <div className={`relative transition-all duration-300 ${
                    timeLeft <= 2 ? 'animate-shake' : ''
                }`}>

                    {/* Question Card */}
                    <div className="mb-4">
                        <p className="text-center text-xl md:text-2xl font-bold text-primary mb-6">
                            {questionText}
                        </p>

                        {/* F1 — 1 jogador + opções */}
                        {question.format === 'F1' && (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center gap-4">
                                    <img
                                        src={question.players[0].photo}
                                        alt={question.players[0].name}
                                        className="w-40 h-40 object-cover rounded-3xl shadow-2xl"
                                    />
                                    <div className="flex items-center gap-2">
                                        <img src={question.players[0].team_logo} alt="logo" className="w-6 h-6 object-contain" />
                                        <p className="font-bold text-lg text-foreground">{question.players[0].name}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
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
                                                    px-6 py-4 rounded-2xl font-bold text-lg
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
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* F2 — 2 jogadores lado a lado */}
                        {question.format === 'F2' && (
                            <div className="grid grid-cols-2 gap-4">
                                {question.players.map(player => {
                                    const isCorrect = String(question.correctAnswer) === String(player.id);
                                    const isSelected = String(selectedAnswer) === String(player.id);
                                    
                                    return (
                                        <button
                                            key={player.id}
                                            onClick={() => handleAnswer(player.id)}
                                            disabled={selectedAnswer !== null}
                                            className={`
                                                rounded-2xl overflow-hidden transition-all duration-300 shadow-lg
                                                ${!selectedAnswer
                                                    ? 'hover:scale-105 hover:shadow-2xl active:scale-100'
                                                    : isSelected
                                                        ? isCorrect
                                                            ? 'scale-105 ring-4 ring-green-500'
                                                            : 'scale-95 ring-4 ring-destructive'
                                                        : isCorrect
                                                            ? 'ring-4 ring-green-500/50'
                                                            : 'opacity-50'
                                                }
                                            `}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={player.photo}
                                                    alt={player.name}
                                                    className="w-full h-48 object-cover object-top"
                                                />
                                                {revealed && (
                                                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                                                        <span className="text-white text-4xl font-black drop-shadow-2xl">
                                                            {player.statValue ?? '—'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-center gap-2 p-3 bg-card">
                                                <img src={player.team_logo} alt="logo" className="w-5 h-5 object-contain" />
                                                <p className="text-sm font-bold text-foreground truncate">{player.name}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* F3 — True/False */}
                        {question.format === 'F3' && (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center gap-4">
                                    <img
                                        src={question.players[0].photo}
                                        alt={question.players[0].name}
                                        className="w-40 h-40 object-cover rounded-3xl shadow-2xl"
                                    />
                                    <div className="flex items-center gap-2">
                                        <img src={question.players[0].team_logo} alt="logo" className="w-6 h-6 object-contain" />
                                        <p className="font-bold text-lg text-foreground">{question.players[0].name}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
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
                                                    px-6 py-4 rounded-2xl font-bold text-lg
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
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats Bar - Lives & Score */}
                    <div className="flex justify-between items-center mt-6">
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

                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm">
                            <span className="text-2xl">⭐</span>
                            <span className="text-2xl font-black text-primary">{score}</span>
                        </div>
                    </div>
                </div>

                {/* Abandon Button */}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => { resetGame(); navigate('/'); }}
                        className="px-6 py-2 rounded-full border border-destructive/50 text-destructive font-semibold text-sm hover:bg-destructive/10 transition-all"
                    >
                        {lang === 'pt' ? 'Abandonar' : 'Abandon'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StatsQuiz;