import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLeaderboard } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function Leaderboard() {
    const navigate = useNavigate();
    const { t } = useTranslation();
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

    if (loading) return <div className="p-8 text-center text-foreground">{t('common.loading')}</div>;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-background p-4">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-foreground">{t('leaderboard.title')}</h1>
                    <Button variant="outline" className="text-foreground" onClick={() => navigate('/')}>
                        {t('leaderboard.back')}
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button 
                        variant={difficulty === 'easy' ? 'default' : 'outline'}
                        className="text-foreground"
                        onClick={() => setDifficulty('easy')}
                    >
                        {t('quiz.easy')}
                    </Button>
                    <Button 
                        variant={difficulty === 'medium' ? 'default' : 'outline'}
                        className="text-foreground"
                        onClick={() => setDifficulty('medium')}
                    >
                        {t('quiz.medium')}
                    </Button>
                    <Button 
                        variant={difficulty === 'hard' ? 'default' : 'outline'}
                        className="text-foreground"
                        onClick={() => setDifficulty('hard')}
                    >
                        {t('quiz.hard')}
                    </Button>
                </div>

                <Card className="p-6">
                    {scores.length === 0 ? (
                        <p className="text-center text-muted-foreground">
                            {t('leaderboard.empty')}
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
                                        <span className="font-medium text-foreground">{score.username}</span>
                                    </div>
                                    <span className="text-xl font-bold text-foreground">{score.score}</span>
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