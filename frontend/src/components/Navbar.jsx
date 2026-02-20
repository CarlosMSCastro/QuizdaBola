import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Navbar({ user, onLogout, darkMode, onToggleDark }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const languages = [
        { code: 'pt', label: 'Português', flag: 'pt' },
        { code: 'en', label: 'English', flag: 'gb' }
    ];

    return (
        <nav className="sticky top-0 z-50 px-4 pt-4 pb-2">
            <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">

                {/* Logo - Hidden below 560px */}
                <img
                    src="/images/logo.png"
                    alt="QuizDaBola"
                    className="hidden min-[560px]:block h-14 cursor-pointer transition-all duration-200 hover:scale-110 hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] active:scale-95 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
                    onClick={() => navigate('/')}
                />

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-4">
                    <button
                        onClick={() => navigate('/leaderboard')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                            location.pathname === '/leaderboard'
                                ? 'text-primary'
                                : 'text-foreground hover:text-primary'
                        }`}
                    >
                        🏆 Leaderboard
                    </button>

                    <div className="w-px h-6 bg-border" />

                    <div className="flex items-center gap-2">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => i18n.changeLanguage(lang.code)}
                                className={`p-2 rounded-lg transition-all ${
                                    i18n.language === lang.code
                                        ? 'bg-foreground/15'
                                        : 'hover:bg-foreground/10'
                                }`}
                            >
                                <img
                                    src={`https://flagcdn.com/24x18/${lang.flag}.png`}
                                    alt={lang.label}
                                    className="w-7 h-auto rounded-sm"
                                />
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onToggleDark}
                        className="p-2 rounded-lg hover:bg-foreground/10 transition-all text-2xl"
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>

                    <div className="w-px h-6 bg-border" />

                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                                    {user.username[0].toUpperCase()}
                                </div>
                                <span className="font-bold text-foreground">{user.username}</span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-foreground hover:bg-foreground/10 transition-all"
                            >
                                {t('navbar.logout')}
                            </button>
                        </div>
                    ) : (
                        <button
                            className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                            onClick={() => navigate('/')}
                        >
                            {t('navbar.login')}
                        </button>
                    )}
                </div>

                {/* Mobile Menu */}
                <div className="lg:hidden max-[550px]:w-full max-[550px]:flex max-[550px]:justify-center min-[551px]:w-64 min-[551px]:flex-shrink-0 min-[551px]:ml-auto relative" ref={mobileMenuRef}>
                    {user ? (
                        <div
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-all duration-200 bg-foreground/20 hover:bg-foreground/30 max-[550px]:w-64 min-[551px]:w-full ${
                                mobileMenuOpen ? 'rounded-t-2xl bg-foreground/20' : 'rounded-2xl'
                            }`}
                        >
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                                {user.username[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-foreground text-sm truncate">{user.username}</span>
                            <span className={`text-muted-foreground text-sm transition-transform duration-300 ml-auto flex-shrink-0 ${mobileMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                        </div>
                    ) : (
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`px-4 py-2 font-bold text-sm transition-all max-[550px]:w-64 min-[551px]:w-full ${
                                mobileMenuOpen 
                                    ? 'bg-foreground/20 text-foreground rounded-t-2xl' 
                                    : 'bg-foreground/20 text-foreground rounded-2xl hover:bg-foreground/30'
                            }`}
                        >
                            Menu
                        </button>
                    )}

                    {mobileMenuOpen && (
                        <div className="absolute top-full left-0 right-0 max-[550px]:mx-auto min-[551px]:right-0 min-[551px]:left-auto w-64 bg-card/95 backdrop-blur-sm rounded-b-2xl shadow-2xl overflow-hidden">
                            <div className="p-4 space-y-4">
                                <button
                                    onClick={() => {
                                        navigate('/leaderboard');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-3 bg-primary/80 hover:bg-primary rounded-xl font-semibold text-foreground transition-all flex items-center gap-3"
                                >
                                    <span className="text-xl">🏆</span>
                                    <span>Leaderboard</span>
                                </button>

                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                                        {t('navbar.language')}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => i18n.changeLanguage(lang.code)}
                                                className={`px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold ${
                                                    i18n.language === lang.code
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted/50 text-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <img
                                                    src={`https://flagcdn.com/24x18/${lang.flag}.png`}
                                                    alt={lang.label}
                                                    className="w-5 h-auto rounded-sm"
                                                />
                                                <span className="text-sm">{lang.code.toUpperCase()}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                                        {t('navbar.theme')}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => {
                                                if (darkMode) onToggleDark();
                                            }}
                                            className={`px-3 py-2 rounded-xl transition-all font-semibold ${
                                                !darkMode
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted/50 text-foreground hover:bg-muted'
                                            }`}
                                        >
                                            ☀️ Light
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!darkMode) onToggleDark();
                                            }}
                                            className={`px-3 py-2 rounded-xl transition-all font-semibold ${
                                                darkMode
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted/50 text-foreground hover:bg-muted'
                                            }`}
                                        >
                                            🌙 Dark
                                        </button>
                                    </div>
                                </div>

                                {user ? (
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 bg-primary/80 hover:bg-primary rounded-xl font-bold text-foreground transition-all"
                                    >
                                        {t('navbar.logout')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            navigate('/login');
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 bg-primary hover:bg-primary/90 rounded-xl font-bold text-primary-foreground transition-all"
                                    >
                                        {t('navbar.login')}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;