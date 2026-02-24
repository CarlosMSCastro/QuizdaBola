import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function EndGame({ 
    score, 
    mode,           // 'classic' ou 'stats'
    token, 
    scoreSaved, 
    isMuted,
    onPlayAgain, 
    t 
}) {
    const navigate = useNavigate();
    const gameoverSoundRef = useRef(null);
    const highscoreSoundRef = useRef(null);

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

    const redirectPath = mode === 'classic' ? '/quiz' : '/stats-quiz';

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