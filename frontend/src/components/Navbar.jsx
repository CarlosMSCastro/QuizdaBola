import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Navbar({ user, onLogout, darkMode, onToggleDark }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [userDropdown, setUserDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'pt' ? 'en' : 'pt';
        i18n.changeLanguage(newLang);
    };

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setUserDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const UserButton = ({ small = false }) => (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setUserDropdown(!userDropdown)}
                className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-all duration-200 bg-foreground/10 hover:bg-foreground/20 hover:shadow-lg
                    ${userDropdown ? 'rounded-t-2xl' : 'rounded-2xl'}`}
            >
                <div className={`${small ? 'w-6 h-6' : 'w-7 h-7'} rounded-full bg-foreground/20 flex items-center justify-center text-foreground font-black ${small ? 'text-xs' : 'text-sm'}`}>
                    {user.username[0].toUpperCase()}
                </div>
                <span className={`${small ? 'text-sm' : 'text-base'} font-bold text-foreground`}>{user.username}</span>
                <span className={`text-muted-foreground text-sm transition-transform duration-300 ml-1 ${userDropdown ? 'rotate-180' : ''}`}>▾</span>
            </div>

            <div className={`absolute right-0 w-full overflow-hidden transition-all duration-200 ${userDropdown ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
                <button
                    onClick={(e) => { e.stopPropagation(); onLogout(); setUserDropdown(false); }}
                    className="w-full px-3 py-2 text-sm font-semibold text-foreground bg-foreground/10 hover:bg-foreground/25 rounded-b-2xl text-left transition-all whitespace-nowrap"
                >
                    {t('navbar.logout')}
                </button>
            </div>
        </div>
    );

    return (
        <nav className="sticky top-0 z-50 px-4 pt-4 pb-2">
            <div className="max-w-4xl mx-auto flex justify-between items-center">

                {/* Logo */}
                <img
                    src="/images/logo.png"
                    alt="QuizDaBola"
                    className="h-14 cursor-pointer transition-all duration-200 hover:scale-110 hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] active:scale-95 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
                    onClick={() => navigate('/')}
                />

                {/* Desktop */}
                <div className="hidden lg:flex items-center gap-3">
                    <button
                        onClick={() => navigate('/leaderboard')}
                        className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200
                            ${location.pathname === '/leaderboard'
                                ? 'bg-foreground/20 text-foreground shadow-lg scale-105'
                                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/15 hover:shadow-lg hover:scale-105 active:scale-95'
                            }`}
                    >
                        🏆 Leaderboard
                    </button>

                    <div className="w-px h-6 bg-border" />

                    <button onClick={toggleLanguage} className="p-2 rounded-lg hover:bg-foreground/15 hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200">
                        <img
                            src={i18n.language === 'pt' ? 'https://flagcdn.com/24x18/gb.png' : 'https://flagcdn.com/24x18/pt.png'}
                            alt={i18n.language === 'pt' ? 'EN' : 'PT'}
                            className="w-8 h-auto rounded-sm"
                        />
                    </button>

                    <button onClick={onToggleDark} className="p-2 rounded-lg hover:bg-foreground/15 hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 text-2xl">
                        {darkMode ? '☀️' : '🌙'}
                    </button>

                    <div className="w-px h-6 bg-border" />

                    {user ? (
                        <UserButton />
                    ) : (
                        <button
                            className="px-4 py-2 rounded-2xl text-sm font-bold bg-foreground/10 text-foreground hover:bg-foreground/20 transition-all duration-200"
                            onClick={() => navigate('/login')}
                        >
                            {t('navbar.login')}
                        </button>
                    )}
                </div>

                {/* Mobile */}
                <div className="lg:hidden flex items-center gap-2">

                    <button
                        onClick={() => navigate('/leaderboard')}
                        className={`p-3 rounded-xl text-xl transition-all duration-200
                            ${location.pathname === '/leaderboard' 
                                ? 'bg-foreground/20 shadow-lg scale-105' 
                                : 'hover:bg-foreground/15 hover:shadow-lg hover:scale-110 active:scale-95'
                            }`}
                    >
                        🏆
                    </button>

                    <button onClick={toggleLanguage} className="p-3 rounded-xl hover:bg-foreground/15 hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200">
                        <img
                            src={i18n.language === 'pt' ? 'https://flagcdn.com/24x18/gb.png' : 'https://flagcdn.com/24x18/pt.png'}
                            alt={i18n.language === 'pt' ? 'EN' : 'PT'}
                            className="w-7 h-auto rounded-sm"
                        />
                    </button>

                    <button onClick={onToggleDark} className="p-3 rounded-xl hover:bg-foreground/15 hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 text-xl">
                        {darkMode ? '☀️' : '🌙'}
                    </button>

                    {user ? (
                        <UserButton small />
                    ) : (
                        <button
                            className="px-3 py-1.5 rounded-2xl text-sm font-bold bg-foreground/10 text-foreground hover:bg-foreground/20 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                            onClick={() => navigate('/login')}
                        >
                            {t('navbar.login')}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;