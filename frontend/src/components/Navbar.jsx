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
        <nav className="sticky top-0 z-50 px-4 pt-4 pb-2" role="navigation" aria-label="Main navigation">
            <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">

                {/* Logo - Hidden below 560px */}
                <img
                    src="/images/logo.png"
                    alt="QuizDaBola - Voltar ao início"
                    className="hidden min-[560px]:block h-14 cursor-pointer transition-all duration-200 hover:scale-101 hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.6)]"
                    onClick={() => navigate('/')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate('/');
                        }
                    }}
                />

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-4">
                    <button
                        onClick={() => navigate('/leaderboard')}
                        aria-label="Ver leaderboard"
                        aria-current={location.pathname === '/leaderboard' ? 'page' : undefined}
                        className={`px-4 py-2 rounded-lg font-semibold text-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            location.pathname === '/leaderboard'
                                ? 'text-primary'
                                : 'text-foreground hover:text-primary'
                        }`}
                    >
                        Leaderboard
                    </button>

                    <div className="flex items-center gap-2" role="group" aria-label={t('navbar.language')}>
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    i18n.changeLanguage(lang.code);
                                    localStorage.setItem('language', lang.code);
                                }}
                                aria-label={`Mudar idioma para ${lang.label}`}
                                aria-pressed={i18n.language === lang.code}
                                className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                    i18n.language === lang.code
                                        ? 'bg-foreground/25'
                                        : 'hover:bg-foreground/10'
                                }`}
                            >
                                <img
                                    src={`https://flagcdn.com/24x18/${lang.flag}.png`}
                                    alt=""
                                    aria-hidden="true"
                                    className="w-7 h-auto rounded-sm"
                                />
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onToggleDark}
                        aria-label={darkMode ? t('navbar.lightMode') : t('navbar.darkMode')}
                        aria-pressed={darkMode}
                        className="p-2 rounded-lg hover:bg-foreground/20 transition-all text-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        <span aria-hidden="true">{darkMode ? '☀️' : '🌙'}</span>
                    </button>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm"
                                    aria-hidden="true"
                                >
                                    {user.username[0].toUpperCase()}
                                </div>
                                <span className="font-bold text-foreground">{user.username}</span>
                            </div>
                            <button
                                onClick={onLogout}
                                aria-label={t('navbar.logout')}
                                className="w-full px-4 py-3 bg-primary/80 hover:bg-primary rounded-xl font-bold hover:text-destructive text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                {t('navbar.logout')}
                            </button>
                        </div>
                    ) : (
                        <button
                            className="px-4 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            onClick={() => navigate('/login')}
                            aria-label={t('navbar.login')}
                        >
                            {t('navbar.login')}
                        </button>
                    )}
                </div>

                {/* Mobile Menu */}
                <div className="lg:hidden max-[550px]:w-full max-[550px]:flex max-[550px]:justify-center min-[551px]:w-64 min-[551px]:flex-shrink-0 min-[551px]:ml-auto relative" ref={mobileMenuRef}>
                    {user ? (
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-expanded={mobileMenuOpen}
                            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-all duration-200 bg-foreground/30 hover:bg-foreground/50 max-[550px]:w-64 min-[551px]:w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                mobileMenuOpen ? 'rounded-t-2xl bg-foreground/30'  : 'rounded-2xl'
                            }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm flex-shrink-0" aria-hidden="true">
                                {user.username[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-foreground text-lg truncate">{user.username}</span>
                            <span className={`text-muted-foreground text-sm transition-transform duration-300 ml-auto flex-shrink-0 ${mobileMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true">▾</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-expanded={mobileMenuOpen}
                            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                            className={`px-4 py-2 font-bold text-sm transition-all max-[550px]:w-64 min-[551px]:w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                mobileMenuOpen 
                                    ? 'bg-foreground/30 text-foreground rounded-t-2xl ' 
                                    : 'bg-foreground/30 text-foreground rounded-2xl hover:bg-foreground/50'
                            }`}
                        >
                            Menu
                        </button>
                    )}

                    {mobileMenuOpen && (
                        <div 
                            className="absolute top-full left-0 border-x-3 border-b-3 border-foreground/30 right-0 max-[550px]:mx-auto min-[551px]:right-0 min-[551px]:left-auto w-64 bg-card/5 backdrop-blur-sm rounded-b-2xl shadow-2xl overflow-hidden"
                            role="menu"
                            aria-label="Menu de navegação"
                        >
                            <div className="p-4 space-y-4">
                                <button
                                    onClick={() => {
                                        navigate('/leaderboard');
                                        setMobileMenuOpen(false);
                                    }}
                                    role="menuitem"
                                    className="w-full px-3 py-2 bg-muted/50 text-foreground hover:bg-primary hover:text-primary-foreground rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                >
                                    <span>Leaderboard</span>
                                </button>

                                <div role="group" aria-labelledby="mobile-lang-label">
                                    <p id="mobile-lang-label" className="text-xs font-bold text-muted-foreground dark:text-foreground/70 uppercase tracking-wide mb-2 px-1">
                                        {t('navbar.language')}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    i18n.changeLanguage(lang.code);
                                                    localStorage.setItem('language', lang.code);
                                                }}
                                                role="menuitemradio"
                                                aria-checked={i18n.language === lang.code}
                                                aria-label={lang.label}
                                                className={`px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                                    i18n.language === lang.code
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted/50 text-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <img
                                                    src={`https://flagcdn.com/24x18/${lang.flag}.png`}
                                                    alt=""
                                                    aria-hidden="true"
                                                    className="w-5 h-auto rounded-sm"
                                                />
                                                <span className="text-sm">{lang.code.toUpperCase()}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div role="group" aria-labelledby="mobile-theme-label">
                                    <p id="mobile-theme-label" className="text-xs font-bold text-muted-foreground dark:text-foreground/70 uppercase tracking-wide mb-2 px-1">
                                        {t('navbar.theme')}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => {
                                                if (darkMode) onToggleDark();
                                            }}
                                            role="menuitemradio"
                                            aria-checked={!darkMode}
                                            aria-label="Light mode"
                                            className={`px-3 py-2 rounded-xl transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                                !darkMode
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted/50 text-foreground hover:bg-muted'
                                            }`}
                                        >
                                            <span aria-hidden="true">☀️</span> Light
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!darkMode) onToggleDark();
                                            }}
                                            role="menuitemradio"
                                            aria-checked={darkMode}
                                            aria-label="Dark mode"
                                            className={`px-3 py-2 rounded-xl transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                                darkMode
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted/50 text-foreground hover:bg-muted'
                                            }`}
                                        >
                                            <span aria-hidden="true">🌙</span> Dark
                                        </button>
                                    </div>
                                </div>

                                {user ? (
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        role="menuitem"
                                        aria-label={t('navbar.logout')}
                                        className="w-full px-4 py-3 bg-primary/80 hover:bg-primary rounded-xl font-bold hover:text-destructive text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    >
                                        {t('navbar.logout')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            navigate('/login');
                                            setMobileMenuOpen(false);
                                        }}
                                        role="menuitem"
                                        aria-label={t('navbar.login')}
                                        className="w-full px-4 py-3 bg-primary hover:bg-primary/90 rounded-xl font-bold text-primary-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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