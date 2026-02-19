import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getStatsQuestion, saveScore } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

function StatsQuiz({ token, user, onLogin }) {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const lang = i18n.language === 'pt' ? 'pt' : 'en';

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
            <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center space-y-6">
                    <h1 className="text-4xl font-black text-foreground tracking-tight">📊 Stats Quiz</h1>
                    <p className="text-muted-foreground">
                        {lang === 'pt'
                            ? 'Testa o teu conhecimento de estatísticas da Liga Portugal!'
                            : 'Test your Liga Portugal statistics knowledge!'}
                    </p>
                    <Button size="lg" className="w-full" onClick={() => setGameStarted(true)}>
                        {lang === 'pt' ? 'Começar ▶️' : 'Start ▶️'}
                    </Button>
                </Card>
            </div>
        );
    }

    // --- GAME OVER ---
    if (gameOver) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center space-y-6">
                    <h1 className="text-4xl font-bold text-foreground">Game Over! 💀</h1>
                    <p className="text-6xl font-bold text-primary">{score}</p>

                    {token ? (
                        <div className="text-sm">
                            {scoreSaved === null && <p className="text-muted-foreground">{lang === 'pt' ? 'A guardar...' : 'Saving...'}</p>}
                            {scoreSaved === 'record' && <p className="text-success font-bold">🏆 {lang === 'pt' ? 'Novo record pessoal!' : 'New personal record!'}</p>}
                            {scoreSaved === 'exists' && <p className="text-muted-foreground">{lang === 'pt' ? 'Já tens um score melhor.' : 'You already have a better score.'}</p>}
                            {scoreSaved === 'error' && <p className="text-destructive">{lang === 'pt' ? 'Erro ao guardar.' : 'Error saving score.'}</p>}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            <button 
                                className="underline text-foreground hover:text-primary transition-colors" 
                                onClick={() => navigate('/login?mode=register&redirect=/stats-quiz')}
                            >
                                {lang === 'pt' ? 'Registe-se' : 'Register'}
                            </button>{' '}
                            {lang === 'pt' ? 'para entrar no leaderboard' : 'to enter the leaderboard'}
                        </p>
                    )}

                    <div className="space-y-3">
                        <Button size="lg" className="w-full" onClick={resetGame}>
                            🔄 {lang === 'pt' ? 'Jogar Novamente' : 'Play Again'}
                        </Button>
                        <Button variant="ghost" className="w-full text-foreground" onClick={() => navigate('/')}>
                            ← {lang === 'pt' ? 'Voltar ao Início' : 'Back to Home'}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (loading) return <div className="p-8 text-center text-foreground">{lang === 'pt' ? 'A carregar...' : 'Loading...'}</div>;
    if (!question) return <div className="p-8 text-center text-foreground">{lang === 'pt' ? 'Erro ao carregar pergunta' : 'Error loading question'}</div>;

    const questionText = lang === 'pt' ? question.question_pt : question.question_en;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-background p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* HUD */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-black text-foreground tracking-tight">📊 Stats Quiz</h1>
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <span key={i} className="text-xl">{i < lives ? '❤️' : '🖤'}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-foreground">⏱️ {timeLeft}s</div>
                        <div className="text-lg font-bold text-foreground">⭐ {score}</div>
                    </div>
                </div>

                {/* Pergunta */}
                <Card className="p-6 space-y-6">
                    <p className="text-center text-lg font-bold text-foreground">{questionText}</p>

                    {/* F1 — 1 jogador + opções */}
                    {question.format === 'F1' && (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center gap-3">
                                <img
                                    src={question.players[0].photo}
                                    alt={question.players[0].name}
                                    className="w-32 h-32 object-cover rounded-xl"
                                />
                                <div className="flex items-center gap-2">
                                    <img src={question.players[0].team_logo} alt="logo" className="w-6 h-6 object-contain" />
                                    <p className="font-semibold text-foreground">{question.players[0].name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {question.options.map(option => (
                                    <Button
                                        key={option}
                                        onClick={() => handleAnswer(option)}
                                        disabled={selectedAnswer !== null}
                                        variant={
                                            selectedAnswer === null ? 'outline' :
                                            String(option) === String(question.correctAnswer) ? 'default' :
                                            String(selectedAnswer) === String(option) ? 'destructive' : 'outline'
                                        }
                                        className="text-foreground h-12 text-lg font-bold"
                                    >
                                        {option}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* F2 — 2 jogadores lado a lado */}
                    {question.format === 'F2' && (
                        <div className="grid grid-cols-2 gap-4">
                            {question.players.map(player => {
                                const isCorrect = String(question.correctAnswer) === String(player.id);
                                const isSelected = String(selectedAnswer) === String(player.id);
                                let borderClass = 'border-border';
                                if (selectedAnswer !== null) {
                                    if (isCorrect) borderClass = 'border-primary shadow-[0_0_12px_rgba(59,130,246,0.3)]';
                                    else if (isSelected) borderClass = 'border-destructive';
                                }

                                return (
                                    <div
                                        key={player.id}
                                        onClick={() => handleAnswer(player.id)}
                                        className={`rounded-xl border-2 ${borderClass} overflow-hidden transition-all duration-200
                                            ${selectedAnswer === null ? 'cursor-pointer hover:border-primary hover:-translate-y-1' : 'cursor-default'}
                                        `}
                                    >
                                        {/* Foto com overlay só na foto */}
                                        <div className="relative">
                                            <img
                                                src={player.photo}
                                                alt={player.name}
                                                className="w-full h-48 object-cover object-top"
                                            />
                                            {revealed && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <span className="text-white text-3xl font-black drop-shadow">
                                                        {player.statValue ?? '—'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Nome e logo por baixo, sempre visível */}
                                        <div className="flex items-center justify-center gap-2 p-2 bg-muted">
                                            <img src={player.team_logo} alt="logo" className="w-5 h-5 object-contain flex-shrink-0" />
                                            <p className="text-sm font-semibold text-foreground truncate">{player.name}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* F3 — True/False */}
                    {question.format === 'F3' && (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center gap-3">
                                <img
                                    src={question.players[0].photo}
                                    alt={question.players[0].name}
                                    className="w-32 h-32 object-cover rounded-xl"
                                />
                                <div className="flex items-center gap-2">
                                    <img src={question.players[0].team_logo} alt="logo" className="w-6 h-6 object-contain" />
                                    <p className="font-semibold text-foreground">{question.players[0].name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: lang === 'pt' ? 'Sim ✅' : 'Yes ✅', value: true },
                                    { label: lang === 'pt' ? 'Não ❌' : 'No ❌', value: false }
                                ].map(opt => (
                                    <Button
                                        key={String(opt.value)}
                                        onClick={() => handleAnswer(opt.value)}
                                        disabled={selectedAnswer !== null}
                                        variant={
                                            selectedAnswer === null ? 'outline' :
                                            opt.value === question.correctAnswer ? 'default' :
                                            selectedAnswer === opt.value ? 'destructive' : 'outline'
                                        }
                                        className="text-foreground h-12 text-lg font-bold"
                                    >
                                        {opt.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                <div className="flex justify-center">
                    <Button variant="destructive" onClick={() => { resetGame(); navigate('/'); }}>
                        {lang === 'pt' ? 'Abandonar Jogo' : 'Abandon Game'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default StatsQuiz;