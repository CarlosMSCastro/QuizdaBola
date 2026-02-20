import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLeaderboard } from '../services/api';

function Leaderboard() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [gameMode, setGameMode] = useState('classic');
    const [difficulty, setDifficulty] = useState('easy');
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadScores();
    }, [gameMode, difficulty]);

    const loadScores = async () => {
        setLoading(true);
        try {
            const data = await getLeaderboard(
                gameMode,
                gameMode === 'classic' ? difficulty : null
            );
            setScores(data);
        } catch (error) {
            console.error('Erro ao carregar leaderboard:', error);
        }
        setLoading(false);
    };

    if (loading) return <div className="p-8 text-center text-foreground">{t('common.loading')}</div>;

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6 md:space-y-10">
                
                {/* Header */}
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 md:p-3 rounded-xl bg-card hover:bg-primary transition-colors"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-3xl md:text-5xl font-black text-primary tracking-tight">
                        Leaderboard
                    </h1>
                </div>

                {/* Selector de Modo */}
                <div className="flex gap-3 md:gap-4">
                    <button
                        onClick={() => setGameMode('classic')}
                        className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-5 rounded-2xl font-bold text-sm md:text-xl transition-all ${
                            gameMode === 'classic'
                                ? 'bg-primary text-background shadow-xl'
                                : 'bg-muted text-foreground hover:bg-muted/70'
                        }`}
                    >
                        <img src="/images/classic.png" alt="Classic" className="w-8 h-8 md:w-12 md:h-12" />
                        <span>{t('landing.classic')}</span>
                    </button>
                    <button
                        onClick={() => setGameMode('stats')}
                        className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-5 rounded-2xl font-bold text-sm md:text-xl transition-all ${
                            gameMode === 'stats'
                                ? 'bg-primary text-background shadow-xl'
                                : 'bg-muted text-foreground hover:bg-muted/70'
                        }`}
                    >
                        <img src="/images/stats.png" alt="Stats" className="w-8 h-8 md:w-12 md:h-12" />
                        <span>Stats Quiz</span>
                    </button>
                </div>

                {/* Selector de Dificuldade (Classic only) */}
                {gameMode === 'classic' && (
                    <div className="flex gap-2 md:gap-4">
                        {['easy', 'medium', 'hard'].map((diff) => (
                            <button
                                key={diff}
                                onClick={() => setDifficulty(diff)}
                                className={`flex-1 px-3 md:px-6 py-2 md:py-4 rounded-xl font-bold text-sm md:text-lg transition-all ${
                                    difficulty === diff
                                        ? 'bg-primary text-background shadow-lg'
                                        : 'bg-muted text-foreground hover:bg-muted/70'
                                }`}
                            >
                                {t(`quiz.${diff}`)}
                            </button>
                        ))}
                    </div>
                )}

                {/* Leaderboard */}
                {scores.length === 0 ? (
                    <div className="text-center py-16 md:py-24 bg-muted/30 rounded-3xl">
                        <p className="text-6xl md:text-8xl mb-4 md:mb-6">🏆</p>
                        <p className="text-lg md:text-2xl text-foreground font-bold">
                            {t('leaderboard.empty')}
                        </p>
                    </div>
                ) : (
                    <div className="bg-card rounded-3xl overflow-hidden shadow-xl">
                        {/* Table Header - Desktop only */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-6 bg-muted">
                            <div className="col-span-2 font-black text-base uppercase tracking-wider text-foreground">Rank</div>
                            <div className="col-span-7 font-black text-base uppercase tracking-wider text-foreground">Jogador</div>
                            <div className="col-span-3 font-black text-base uppercase tracking-wider text-foreground text-right">Score</div>
                        </div>

                        {/* Scores */}
                        <div className="divide-y divide-border">
                            {scores.map((score, index) => (
                                <div
                                    key={index}
                                    className={`grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-8 py-4 md:py-6 transition-colors bg-muted ${
                                        index < 3 ? 'bg-accent/5' : ''
                                    }`}
                                >
                                    <div className="col-span-2 flex items-center">
                                        <span className="text-2xl md:text-4xl font-black text-foreground">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </span>
                                    </div>
                                    <div className="col-span-7 flex items-center">
                                        <span className={`text-base md:text-2xl font-bold truncate ${
                                            index === 0 ? 'text-primary' : 'text-foreground'
                                        }`}>
                                            {score.username}
                                        </span>
                                    </div>
                                    <div className="col-span-3 flex items-center justify-end">
                                        <span className={`text-xl md:text-3xl font-black ${
                                            index === 0 ? 'text-primary' : 'text-foreground'
                                        }`}>
                                            {score.score}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Leaderboard;