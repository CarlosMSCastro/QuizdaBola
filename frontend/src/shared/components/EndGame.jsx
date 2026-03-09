import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../../shared/services/api';

function EndGame({ 
    score, 
    mode,
    token, 
    scoreSaved,
    isMuted,
    selectedSeason,
    onPlayAgain, 
    t 
}) {
    const navigate = useNavigate();
    const gameoverSoundRef = useRef(null);
    const highscoreSoundRef = useRef(null);
    const [topScores, setTopScores] = useState([]);

    // Initialize audio
    useEffect(() => {
        gameoverSoundRef.current = new Audio('/sounds/gameover.mp3');
        gameoverSoundRef.current.volume = 0.1;

        highscoreSoundRef.current = new Audio('/sounds/highscore.mp3');
        highscoreSoundRef.current.volume = 0.1;
    }, []);

    // Play sound when game over appears
    useEffect(() => {
        if (isMuted) return;

        if (scoreSaved === 'record' && highscoreSoundRef.current) {
            highscoreSoundRef.current.currentTime = 0;
            highscoreSoundRef.current.play().catch(() => {});
        } 
        else if (scoreSaved && gameoverSoundRef.current) {
            gameoverSoundRef.current.currentTime = 0;
            gameoverSoundRef.current.play().catch(() => {});
        }
    }, [scoreSaved, isMuted]);

    // Fetch top 3
    useEffect(() => {
        const fetchTop3 = async () => {
            try {
                const competitionId = selectedSeason === 'global' ? null : selectedSeason;
                const data = await getLeaderboard(mode, competitionId);
                setTopScores(data.slice(0, 3));
            } catch (error) {
                console.error('Erro ao buscar leaderboard:', error);
            }
        };

        fetchTop3();
    }, [mode, selectedSeason]);

    const redirectPath = mode === 'classic' ? '/quiz' : '/stats-quiz';
    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div key="gameover" className="min-h-screen flex items-center justify-center p-4 page-transition bg-gradient-to-br from-background via-background to-muted/20 animate-in fade-in zoom-in duration-500">
            <div className="max-w-2xl w-full text-center space-y-8">
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-black text-primary tracking-tight">
                        {t('gameOver.title') || 'Game Over'}
                    </h1>
                    
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm md:text-base text-muted-foreground uppercase tracking-widest">
                            {t('quiz.score') || 'Pontuação'}
                        </span>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                            <p className="relative text-8xl md:text-9xl font-black text-foreground/60 drop-shadow-2xl">
                                {score}
                            </p>
                        </div>
                    </div>

                    {token && scoreSaved === 'record' && (
                        <div className="animate-in fade-in zoom-in duration-500">
                            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-success/20 border-2 border-success">
                                <span className="text-lg font-bold text-success">
                                    {t('quiz.newRecord') || 'Novo Record!'}
                                </span>
                            </div>
                        </div>
                    )}

                    {!token && (
                        <div className="pt-4">
                            <p className="text-sm md:text-base text-muted-foreground">
                                <button 
                                    className="underline text-primary hover:text-primary/80 transition-colors font-semibold" 
                                    onClick={() => navigate(`/login?mode=register&redirect=${redirectPath}`)}
                                >
                                    {t('quiz.registerLink') || 'Regista-te'}
                                </button>{' '}
                                {t('quiz.registerPrompt') || 'para guardar a tua pontuação!'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Top 3 */}
                {topScores.length > 0 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom duration-500">
                        <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                            🏆 Top 3
                        </h2>
                        <div className="space-y-2">
                            {topScores.map((entry, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between px-5 py-3 rounded-2xl border-2 transition-all
                                        ${index === 0
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border bg-white/5 dark:bg-muted/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{medals[index]}</span>
                                        <span className={`font-bold text-base ${index === 0 ? 'text-primary' : 'text-foreground'}`}>
                                            {entry.username}
                                        </span>
                                    </div>
                                    <span className={`font-black text-xl ${index === 0 ? 'text-primary' : 'text-foreground'}`}>
                                        {entry.score}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <button
                        onClick={onPlayAgain}
                        className="px-8 py-4 rounded-full bg-primary text-background font-bold text-lg hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
                    >
                        {t('gameOver.playAgain') || 'Jogar Novamente'}
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-4 rounded-full border-2 border-primary text-primary font-bold text-lg hover:bg-primary/10 hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        {t('gameOver.backHome') || 'Voltar ao Início'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EndGame;