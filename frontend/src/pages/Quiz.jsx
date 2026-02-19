import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getQuestion, saveScore } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
countries.registerLocale(en);

function Quiz({ token, user, onLogin }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    
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

    const getFlagEmoji = (countryName) => {
        const code = getCountryCode(countryName);
        if (code === 'un') return '🌍';
        if (code === 'gb-eng') return '🏴󠁧󠁢󠁥󠁬󠁳󠁿';
        return code.toUpperCase().replace(/./g, c =>
            String.fromCodePoint(c.charCodeAt(0) + 127397)
        );
    };

    const difficultyLabel = (d) => {
        if (d === 'easy') return t('quiz.easy');
        if (d === 'medium') return t('quiz.medium');
        return t('quiz.hard');
    };

    if (!gameStarted && !gameOver) {
        return (
            <>
                <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
                    <Card className="max-w-md w-full p-8 text-center space-y-6">
                        <h1 className="text-4xl font-bold text-foreground">⚽ {t('quiz.title')}</h1>
                        <p className="text-muted-foreground">{t('quiz.selectDifficulty')}</p>
                        
                        <div className="space-y-3">
                            <Button 
                                size="lg" 
                                className="w-full"
                                variant={difficulty === 'easy' ? 'default' : 'outline'}
                                onClick={() => changeDifficulty('easy')}
                            >
                                {t('quiz.easy')}
                            </Button>
                            <Button 
                                size="lg" 
                                className="w-full"
                                variant={difficulty === 'medium' ? 'default' : 'outline'}
                                onClick={() => changeDifficulty('medium')}
                            >
                                {t('quiz.medium')}
                            </Button>
                            <Button 
                                size="lg" 
                                className="w-full"
                                variant={difficulty === 'hard' ? 'default' : 'outline'}
                                onClick={() => changeDifficulty('hard')}
                            >
                                {t('quiz.hard')}
                            </Button>
                        </div>

                        <Button size="lg" className="w-full mt-4" onClick={startGame}>
                            {t('quiz.start')}
                        </Button>
                    </Card>
                </div>

                <LoginModal 
                    open={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSuccess={(newToken, newUser) => {
                        onLogin(newToken, newUser);
                        setShowLoginModal(false);
                    }}
                />
            </>
        );
    }

    if (gameOver) {
        return (
            <>
                <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
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
                                <button className="underline text-foreground" onClick={() => setShowLoginModal(true)}>
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

                <LoginModal
                    open={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSuccess={async (newToken, newUser) => {
                        onLogin(newToken, newUser);
                        try {
                            const res = await saveScore(score, difficulty, newToken);
                            if (res.isNewRecord) setScoreSaved('record');
                            else setScoreSaved('exists');
                        } catch {
                            setScoreSaved('error');
                        }
                    }}
                />
            </>
        );
    }

    if (loading) return <div className="p-8 text-center text-foreground">{t('common.loading')}</div>;
    if (!question) return <div className="p-8 text-center text-foreground">{t('common.error')}</div>;

    return (
        <>
            <div className="min-h-[calc(100vh-4rem)] bg-background p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-foreground">{t('quiz.title')}</h1>
                            <div className="flex gap-1">
                                {[...Array(3)].map((_, i) => (
                                    <span key={i} className="text-2xl">
                                        {i < lives ? '❤️' : '🖤'}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
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

                            <div className="text-3xl font-bold text-foreground">
                                ⏱️ {t('quiz.time', { seconds: timeLeft })}
                            </div>
                            <div className="text-xl font-bold text-foreground">
                                ⭐ {score}
                            </div>
                        </div>
                    </div>

                    <Card className="p-6">
                        <div className="relative w-64 h-64 mx-auto mb-6">
                            <img 
                                src={question.photo} 
                                alt="Jogador" 
                                className="w-full h-full object-cover rounded-lg"
                            />
                            
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
                                    className="w-full text-foreground"
                                >
                                    {option}
                                </Button>
                            ))}
                        </div>
                    </Card>

                    <div className="flex justify-center">
                        <Button variant="destructive" onClick={() => { resetGame(); navigate('/'); }}>
                            {t('quiz.abandon')}
                        </Button>
                    </div>
                </div>
            </div>

            <LoginModal 
                open={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={(newToken, newUser) => {
                    onLogin(newToken, newUser);
                    setShowLoginModal(false);
                }}
            />
        </>
    );
}

export default Quiz;