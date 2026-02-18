import { useState, useEffect } from 'react';
import { getQuestion } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';


function Quiz() {
    const [difficulty, setDifficulty] = useState('easy');
    const [question, setQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);


    const navigate = useNavigate();

    useEffect(() => {
        loadQuestion();
    }, [difficulty]);

    const loadQuestion = async () => {
        setLoading(true);
        setSelectedAnswer(null);
        try {
            const data = await getQuestion(difficulty);
            setQuestion(data);
        } catch (error) {
            console.error('Erro ao carregar pergunta:', error);
        }
        setLoading(false);
    };

    const handleAnswer = (answer) => {
        setSelectedAnswer(answer);
        if (answer === question.correctAnswer) {
            setScore(score + 1);
        }
        setTimeout(() => loadQuestion(), 1500);
    };

    if (loading) return <div className="p-8 text-center">A carregar...</div>;
    if (!question) return <div className="p-8 text-center">Erro ao carregar pergunta</div>;

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Liga Portugal Quiz</h1>
                    <p className="text-xl">Pontuação: {score}</p>
                </div>

                {/* Selector de dificuldade */}
                <div className="flex gap-2">
                    <Button 
                        variant={difficulty === 'easy' ? 'default' : 'outline'}
                        onClick={() => setDifficulty('easy')}
                    >
                        Fácil
                    </Button>
                    <Button 
                        variant={difficulty === 'medium' ? 'default' : 'outline'}
                        onClick={() => setDifficulty('medium')}
                    >
                        Médio
                    </Button>
                    <Button 
                        variant={difficulty === 'hard' ? 'default' : 'outline'}
                        onClick={() => setDifficulty('hard')}
                    >
                        Difícil
                    </Button>
                </div>

                <Card className="p-6">
                    {/* Foto do jogador */}
                    <img 
                        src={question.photo} 
                        alt="Jogador" 
                        className="w-64 h-64 object-cover mx-auto mb-6 rounded-lg"
                    />

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
            </div>´
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => navigate('/')}>
                    ← Voltar
                </Button>
                <Button variant="outline" onClick={() => navigate('/leaderboard')}>
                    🏆 Leaderboard
                </Button>
            </div>
        </div>
    );
}

export default Quiz;