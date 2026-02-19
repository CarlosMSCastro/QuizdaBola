import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import LoginModal from './LoginModal';

function Navbar({ user, onLogout, onLogin, darkMode, onToggleDark }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'pt' ? 'en' : 'pt';
        i18n.changeLanguage(newLang);
    };

    const links = [
        { label: `🏆 Leaderboard`, path: '/leaderboard' },
    ];

    return (
        <>
            <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 shadow-sm">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    
                    {/* Logo */}
                    <span 
                        className="text-xl font-black cursor-pointer text-foreground tracking-tight hover:text-primary transition-colors"
                        onClick={() => navigate('/')}
                    >
                        ⚽ QuizDaBola
                    </span>

                    {/* Links desktop */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map(link => (
                            <button
                                key={link.path}
                                onClick={() => navigate(link.path)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                                    ${location.pathname === link.path
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-foreground hover:bg-muted'
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* Auth + toggles + hamburger */}
                    <div className="flex items-center gap-1">

                        {/* Language toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title={i18n.language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
                        >
                            <img
                                src={i18n.language === 'pt' 
                                    ? 'https://flagcdn.com/24x18/gb.png' 
                                    : 'https://flagcdn.com/24x18/pt.png'}
                                alt={i18n.language === 'pt' ? 'EN' : 'PT'}
                                className="w-6 h-auto rounded-sm"
                            />
                        </button>

                        {/* Dark mode toggle */}
                        <button
                            onClick={onToggleDark}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground text-lg"
                            title={darkMode ? t('navbar.lightMode') : t('navbar.darkMode')}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>

                        {/* Divider */}
                        <div className="hidden md:block w-px h-6 bg-border mx-1" />

                        {user ? (
                            <div className="hidden md:flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">👤 {user.username}</span>
                                <button
                                    onClick={onLogout}
                                    className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-border text-foreground hover:bg-muted transition-colors"
                                >
                                    {t('navbar.logout')}
                                </button>
                            </div>
                        ) : (
                            <button
                                className="hidden md:flex px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                onClick={() => setShowLoginModal(true)}
                            >
                                {t('navbar.login')}
                            </button>
                        )}

                        {/* Hamburger mobile */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-foreground text-xl"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>

                {/* Menu mobile */}
                {menuOpen && (
                    <div className="md:hidden mt-3 flex flex-col gap-2 px-2 pb-3 border-t border-border/50 pt-3">
                        {links.map(link => (
                            <button
                                key={link.path}
                                className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-left transition-all
                                    ${location.pathname === link.path
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-foreground hover:bg-muted'
                                    }`}
                                onClick={() => { navigate(link.path); setMenuOpen(false); }}
                            >
                                {link.label}
                            </button>
                        ))}
                        <div className="border-t border-border/50 pt-2 mt-1">
                            {user ? (
                                <>
                                    <p className="text-sm text-muted-foreground text-center mb-2">👤 {user.username}</p>
                                    <button
                                        className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold border border-border text-foreground hover:bg-muted transition-colors"
                                        onClick={() => { onLogout(); setMenuOpen(false); }}
                                    >
                                        {t('navbar.logout')}
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                    onClick={() => { setShowLoginModal(true); setMenuOpen(false); }}
                                >
                                    {t('navbar.login')}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <LoginModal
                open={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={(newToken, newUser) => {
                    onLogin(newToken, newUser);
                    setShowLoginModal(false);
                }}
            />
        </>
    );
}

export default Navbar;