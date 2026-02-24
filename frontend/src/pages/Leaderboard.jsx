import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLeaderboard, getCompetitions } from '../services/api';

function Leaderboard() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [gameMode, setGameMode] = useState(() => {
        return localStorage.getItem('leaderboardMode') || 'classic';
    });
    const [league, setLeague] = useState(() => {
        return localStorage.getItem('leaderboardLeague') || 'global';
    });
    const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false);
    const [scores, setScores] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    // Opção "Global" + competições da API
    const leagues = [
        { id: 'global', name: 'Global', logo: null, active: true },
        ...competitions
    ];

    const selectedLeague = leagues.find(l => l.id === league);

    useEffect(() => {
        // Buscar competições da API
        const fetchCompetitions = async () => {
            try {
                const data = await getCompetitions();
                setCompetitions(data);
            } catch (error) {
                console.error('Erro ao buscar competições:', error);
            }
        };

        fetchCompetitions();
    }, []);

    useEffect(() => {
        loadScores();
    }, [gameMode, league]);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setLeagueDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const loadScores = async () => {
        setLoading(true);
        try {
            const competitionId = league === 'global' ? null : league;
            const data = await getLeaderboard(
                gameMode,
                null, // Sempre null agora
                competitionId
            );
            setScores(data);
        } catch (error) {
            console.error('Erro ao carregar leaderboard:', error);
        }
        setLoading(false);
    };

    const handleLeagueClick = (lg) => {
        // Só permite selecionar se for Global ou se a competição estiver ativa
        if (lg.id === 'global' || lg.active) {
            setLeague(lg.id);
            localStorage.setItem('leaderboardLeague', lg.id);
            setLeagueDropdownOpen(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-foreground">{t('common.loading')}</div>;

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6 md:space-y-10">
                
                {/* Header */}
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 md:p-3 rounded-xl bg-primary hover:scale-105 transition-colors"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-3xl md:text-5xl font-black text-primary tracking-tight">
                        Leaderboard
                    </h1>
                </div>

                {/* League Selector Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setLeagueDropdownOpen(!leagueDropdownOpen)}
                        className="w-full flex items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 rounded-2xl font-bold text-sm md:text-lg transition-all bg-muted/50 hover:bg-muted/70 dark:bg-muted dark:hover:bg-muted/80 text-foreground"
                    >
                        <div className="flex items-center gap-3">
                            {selectedLeague?.logo && (
                                <img src={selectedLeague.logo} alt={selectedLeague.name} className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                            )}
                            <span>{selectedLeague?.name || 'Global'}</span>
                        </div>
                        <span className={`text-muted-foreground transition-transform duration-300 ${leagueDropdownOpen ? 'rotate-180' : ''}`}>▾</span>
                    </button>

                    {leagueDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-card/15 dark:bg-card/95 backdrop-blur-xs rounded-2xl shadow-2xl overflow-hidden z-10 border border-border">
                            {leagues.map((lg) => {
                                const isActive = lg.id === 'global' || lg.active;
                                
                                return (
                                    <button
                                        key={lg.id}
                                        onClick={() => handleLeagueClick(lg)}
                                        disabled={!isActive}
                                        className={`
                                            relative w-full flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 font-bold text-sm md:text-lg transition-all
                                            ${!isActive ? 'cursor-not-allowed opacity-50' : ''}
                                            ${league === lg.id
                                                ? 'bg-primary text-background'
                                                : isActive 
                                                    ? 'hover:bg-muted/50 dark:hover:bg-muted/30 text-foreground'
                                                    : 'text-foreground'
                                            }
                                        `}
                                    >
                                        {lg.logo && (
                                            <img 
                                                src={lg.logo} 
                                                alt={lg.name} 
                                                className={`w-6 h-6 md:w-8 md:h-8 object-contain ${
                                                    !isActive ? 'grayscale' : ''
                                                }`}
                                            />
                                        )}
                                        <span>{lg.name}</span>
                                        
                                        {!isActive && (
                                            <span className="ml-auto px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
                                                🔒 {t('landing.comingSoon') || 'Em breve'}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Selector de Modo */}
                <div className="flex gap-3 md:gap-4">
                    <button
                        onClick={() => {
                            setGameMode('classic');
                            localStorage.setItem('leaderboardMode', 'classic');
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-5 rounded-2xl font-bold text-sm md:text-xl transition-all ${
                            gameMode === 'classic'
                                ? 'bg-primary text-background shadow-xl'
                                : 'bg-muted/50 hover:bg-muted/70 dark:bg-muted dark:hover:bg-muted/80 dark:text-foreground text-accent'
                        }`}
                    >
                        <img src="/images/classic.png" alt="Classic" className="w-8 h-8 md:w-12 md:h-12" />
                        <span>{t('landing.classic')}</span>
                    </button>
                    <button
                        onClick={() => {
                            setGameMode('stats');
                            localStorage.setItem('leaderboardMode', 'stats');
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-5 rounded-2xl font-bold text-sm md:text-xl transition-all ${
                            gameMode === 'stats'
                                ? 'bg-primary text-background shadow-xl'
                                : 'bg-muted/50 hover:bg-muted/70 dark:bg-muted dark:hover:bg-muted/80 dark:text-foreground text-accent'
                        }`}
                    >
                        <img src="/images/stats.png" alt="Stats" className="w-8 h-8 md:w-12 md:h-12" />
                        <span>Stats Quiz</span>
                    </button>
                </div>


                {/* Leaderboard */}
                {scores.length === 0 ? (
                    <div className="text-center py-16 md:py-24 dark:bg-muted/80  bg-muted/50 rounded-3xl">
                        <p className="text-lg md:text-2xl dark:text-foreground text-accent font-bold">
                            {t('leaderboard.empty')}
                        </p>
                    </div>
                ) : (
                    <div className="dark:bg-card/80 bg-card/25 rounded-3xl overflow-hidden shadow-xl">
                        {/* League Header - Desktop only */}
                        {league !== 'global' && selectedLeague?.logo && (
                            <div className="hidden md:flex items-center gap-3 px-8 py-4 dark:bg-muted/60 bg-muted/40 border-b border-border">
                                <img src={selectedLeague.logo} alt={selectedLeague.name} className="w-8 h-8 object-contain" />
                                <span className="font-black text-lg text-foreground">{selectedLeague.name}</span>
                            </div>
                        )}

                        {/* Table Header - Desktop only */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-6 dark:bg-muted/80 bg-muted/50">
                            <div className="col-span-2 font-black text-base uppercase tracking-wider text-foreground">Rank</div>
                            <div className="col-span-7 font-black text-base uppercase tracking-wider text-foreground">Jogador</div>
                            <div className="col-span-3 font-black text-base uppercase tracking-wider text-foreground text-right">Score</div>
                        </div>

                        {/* Scores */}
                        <div className="divide-y divide-border">
                            {scores.map((score, index) => (
                                <div
                                    key={index}
                                    className={`grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-8 py-4 md:py-6 transition-colors dark:bg-muted/10 bg-muted-50 ${
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