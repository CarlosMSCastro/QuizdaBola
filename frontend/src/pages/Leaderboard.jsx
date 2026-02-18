import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function Leaderboard() {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState('easy');
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadScores();
    }, [difficulty]);

    const loadScores = async () => {
        setLoading(true);
        try {
            const data = await getLeaderboard(difficulty);
            setScores(data);
        } catch (error) {
            console.error('Erro ao carregar leaderboard:', error);
        }
        setLoading(false);
    };

    if (loading) return <div className="p-8 text-center">A carregar...</div>;

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">🏆 Leaderboard</h1>
                    <Button variant="outline" onClick={() => navigate('/')}>
                        Voltar
                    </Button>
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
                    {scores.length === 0 ? (
                        <p className="text-center text-muted-foreground">
                            Ainda não há pontuações nesta dificuldade.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {scores.map((score, index) => (
                                <div 
                                    key={index}
                                    className="flex justify-between items-center p-3 border-b last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-bold text-muted-foreground">
                                            #{index + 1}
                                        </span>
                                        <span className="font-medium">{score.username}</span>
                                    </div>
                                    <span className="text-xl font-bold">{score.score}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default Leaderboard;