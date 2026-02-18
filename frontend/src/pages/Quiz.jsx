import { useState, useEffect } from 'react';
import { getQuestion, saveScore } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal';

function Quiz() {
    const navigate = useNavigate();
    
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
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    
    // Sistema de ajudas
    const [helpsLeft, setHelpsLeft] = useState(2);
    const [usedHelps, setUsedHelps] = useState({ nationality: false, team: false });
    const [activeHelp, setActiveHelp] = useState(null);

    // Verificar se já tem sessão
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
    }, []);

    // Carregar pergunta quando jogo inicia
    useEffect(() => {
        if (!gameOver && gameStarted) {
            loadQuestion();
        }
    }, [gameStarted]);

    // Timer countdown
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
        setActiveHelp(null); // reset ajuda ao carregar nova pergunta
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

        // escolher ajuda aleatória entre as disponíveis
        const availableHelps = [];
        if (!usedHelps.nationality) availableHelps.push('nationality');
        if (!usedHelps.team) availableHelps.push('team');

        if (availableHelps.length === 0) return;

        const randomHelp = availableHelps[Math.floor(Math.random() * availableHelps.length)];
        
        setActiveHelp(randomHelp);
        setUsedHelps({ ...usedHelps, [randomHelp]: true });
        setHelpsLeft(helpsLeft - 1);
        setTimeLeft(prev => prev + 5); // ← ADICIONA ESTA LINHA
    };

    const startGame = () => {
        setGameStarted(true);
    };

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
    };

    const changeDifficulty = (newDifficulty) => {
        setDifficulty(newDifficulty);
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
    };

    // Converter código do país para emoji de bandeira
    const getFlagEmoji = (countryName) => {
        const countryMap = {
            'Portugal': '🇵🇹',
            'Brazil': '🇧🇷',
            'Spain': '🇪🇸',
            'France': '🇫🇷',
            'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
            'Germany': '🇩🇪',
            'Italy': '🇮🇹',
            'Netherlands': '🇳🇱',
            'Argentina': '🇦🇷',
            'Uruguay': '🇺🇾',
            'Colombia': '🇨🇴',
            'Mexico': '🇲🇽',
            'Sweden': '🇸🇪',
            'Denmark': '🇩🇰',
            'Norway': '🇳🇴',
            'Belgium': '🇧🇪',
            'Croatia': '🇭🇷',
            'Serbia': '🇷🇸',
            'Turkey': '🇹🇷',
            'Morocco': '🇲🇦',
            'Senegal': '🇸🇳',
            'Nigeria': '🇳🇬',
            'Ghana': '🇬🇭',
            'Cameroon': '🇨🇲',
            'Japan': '🇯🇵',
            'Korea Republic': '🇰🇷',
            'Iran': '🇮🇷',
            'Australia': '🇦🇺',
            'USA': '🇺🇸',
            'Canada': '🇨🇦',
            'Chile': '🇨🇱',
            'Paraguay': '🇵🇾',
            'Poland': '🇵🇱',
            'Switzerland': '🇨🇭',
            'Austria': '🇦🇹'
        };
        
        console.log('Country:', countryName, 'Flag:', countryMap[countryName]); // debug
        return countryMap[countryName] || '🌍';
    };
    const getCountryCode = (countryName) => {
        const codes = {
            'Portugal': 'pt', 'Brazil': 'br', 'Spain': 'es', 'France': 'fr',
            'England': 'gb-eng', 'Germany': 'de', 'Italy': 'it', 'Netherlands': 'nl',
            'Argentina': 'ar', 'Uruguay': 'uy', 'Czechia': 'cz', 'Poland': 'pl',
            'USA': 'us', 'Mexico': 'mx', 'Colombia': 'co', 'Belgium': 'be'
            // adiciona mais conforme necessário
        };
        return codes[countryName] || 'un'; // 'un' = ONU (fallback)
    };

    // Screen de escolha de dificuldade
    if (!gameStarted && !gameOver) {
        return (
            <>
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <Card className="max-w-md w-full p-8 text-center space-y-6">
                        <h1 className="text-4xl font-bold">⚽ Quiz</h1>
                        <p className="text-muted-foreground">Escolhe a dificuldade:</p>
                        
                        <div className="space-y-3">
                            <Button 
                                size="lg" 
                                className="w-full"
                                variant={difficulty === 'easy' ? 'default' : 'outline'}
                                onClick={() => changeDifficulty('easy')}
                            >
                                Fácil
                            </Button>
                            <Button 
                                size="lg" 
                                className="w-full"
                                variant={difficulty === 'medium' ? 'default' : 'outline'}
                                onClick={() => changeDifficulty('medium')}
                            >
                                Médio
                            </Button>
                            <Button 
                                size="lg" 
                                className="w-full"
                                variant={difficulty === 'hard' ? 'default' : 'outline'}
                                onClick={() => changeDifficulty('hard')}
                            >
                                Difícil
                            </Button>
                        </div>

                        <Button 
                            size="lg" 
                            className="w-full mt-4"
                            onClick={startGame}
                        >
                            Começar ▶️
                        </Button>

                        <Button 
                            variant="ghost" 
                            className="w-full"
                            onClick={() => navigate('/')}
                        >
                            ← Voltar
                        </Button>
                    </Card>
                </div>

                <LoginModal 
                    open={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSuccess={async (newToken, newUser) => {
                        setToken(newToken);
                        setUser(newUser);
                        try {
                            await saveScore(score, difficulty, newToken);
                            alert('Pontuação guardada!');
                            navigate('/leaderboard');
                        } catch (error) {
                            alert('Erro ao guardar pontuação');
                        }
                    }}
                />
            </>
        );
    }

    // Screen de Game Over
    if (gameOver) {
        return (
            <>
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <Card className="max-w-md w-full p-8 text-center space-y-6">
                        <h1 className="text-4xl font-bold">Game Over! 💀</h1>
                        <p className="text-6xl font-bold text-primary">{score}</p>
                        <p className="text-muted-foreground">
                            Dificuldade: {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}
                        </p>
                        
                        <div className="space-y-3">
                            <Button 
                                size="lg" 
                                className="w-full"
                                onClick={resetGame}
                            >
                                🔄 Jogar Novamente
                            </Button>
                            
                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={async () => {
                                    if (token) {
                                        try {
                                            await saveScore(score, difficulty, token);
                                            alert('Pontuação guardada!');
                                            navigate('/leaderboard');
                                        } catch (error) {
                                            alert('Erro ao guardar pontuação');
                                        }
                                    } else {
                                        setShowLoginModal(true);
                                    }
                                }}
                            >
                                💾 Guardar Pontuação
                            </Button>

                            <Button 
                                variant="ghost" 
                                className="w-full"
                                onClick={() => navigate('/')}
                            >
                                ← Voltar ao Início
                            </Button>
                        </div>
                    </Card>
                </div>

                <LoginModal 
                    open={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSuccess={async (newToken, newUser) => {
                        setToken(newToken);
                        setUser(newUser);
                        try {
                            await saveScore(score, difficulty, newToken);
                            alert('Pontuação guardada!');
                            navigate('/leaderboard');
                        } catch (error) {
                            alert('Erro ao guardar pontuação');
                        }
                    }}
                />
            </>
        );
    }

    if (loading) return <div className="p-8 text-center">A carregar...</div>;
    if (!question) return <div className="p-8 text-center">Erro ao carregar pergunta</div>;

    return (
        <>
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header com vidas, timer, score e ajudas */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold">Quiz</h1>
                            <div className="flex gap-1">
                                {[...Array(3)].map((_, i) => (
                                    <span key={i} className="text-2xl">
                                        {i < lives ? '❤️' : '🖤'}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* Botão de ajuda */}
                            <button
                                onClick={useHelp}
                                disabled={helpsLeft === 0}
                                className={`relative text-4xl transition-all ${
                                    helpsLeft === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'
                                }`}
                            >
                                💡
                                {helpsLeft > 0 && (
                                    <Badge 
                                        variant="destructive" 
                                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                    >
                                        {helpsLeft}
                                    </Badge>
                                )}
                            </button>

                            <div className="text-3xl font-bold">
                                ⏱️ {timeLeft}s
                            </div>
                            <div className="text-xl font-bold">
                                ⭐ {score}
                            </div>
                        </div>
                    </div>

                    <Card className="p-6">
                        {/* Container da foto com overlay de ajuda */}
                        <div className="relative w-64 h-64 mx-auto mb-6">
                            <img 
                                src={question.photo} 
                                alt="Jogador" 
                                className="w-full h-full object-cover rounded-lg"
                            />
                            
                            {/* Overlay de ajuda */}
                            {activeHelp === 'nationality' && (
                                <div className="absolute top-2 right-2 rounded-lg shadow-lg flex items-center gap-2">
                                    <img 
                                        src={`https://flagcdn.com/48x36/${getCountryCode(question.nationality)}.png`}
                                        alt={question.nationality}
                                        className="w-12 h-9"
                                    />
                                </div>
                            )}
                            
                            {activeHelp === 'team' && question.team_logo && (
                                <div className="absolute top-2 right-2 rounded-lg shadow-lg">
                                    <img 
                                        src={question.team_logo} 
                                        alt="Logo equipa" 
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Opções de resposta */}
                        <div className="space-y-2">
                            {question.options.map((option) => (
                                <Button
                                    key={option}
                                    onClick={() => handleAnswer(option)}
                                    disabled={selectedAnswer !== null}
                                    variant={
                                        selectedAnswer === option
                                            ? option === question.correctAnswer
                                                ? 'default'
                                                : 'destructive'
                                            : 'outline'
                                    }
                                    className="w-full"
                                >
                                    {option}
                                </Button>
                            ))}
                        </div>
                    </Card>

                    {/* Botões de navegação */}
                    <div className="flex justify-between items-center">
                        <Button variant="ghost" onClick={() => navigate('/')}>
                            ← Voltar
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/leaderboard')}>
                            🏆 Leaderboard
                        </Button>
                    </div>
                </div>
            </div>

            <LoginModal 
                open={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={async (newToken, newUser) => {
                    setToken(newToken);
                    setUser(newUser);
                    try {
                        await saveScore(score, difficulty, newToken);
                        alert('Pontuação guardada!');
                        navigate('/leaderboard');
                    } catch (error) {
                        alert('Erro ao guardar pontuação');
                    }
                }}
            />
            
        </>
    );
}

export default Quiz;