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
        { label: `⚽ ${t('landing.playNow')}`, path: '/quiz' },
        { label: `🏆 Leaderboard`, path: '/leaderboard' },
    ];

    return (
        <>
            <nav className="bg-background border-b px-4 py-3">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    
                    {/* Logo */}
                    <span 
                        className="text-xl font-bold cursor-pointer text-foreground"
                        onClick={() => navigate('/')}
                    >
                        ⚽ QuizDaBola
                    </span>

                    {/* Links desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        {links.map(link => (
                            <Button
                                key={link.path}
                                variant={location.pathname === link.path ? 'default' : 'ghost'}
                                className="text-foreground"
                                onClick={() => navigate(link.path)}
                            >
                                {link.label}
                            </Button>
                        ))}
                    </div>

                    {/* Auth + toggles + hamburger */}
                    <div className="flex items-center gap-2">

                        {/* Language toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="px-2 py-1 rounded hover:bg-muted transition-colors"
                            title={i18n.language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
                        >
                            <img
                                src={i18n.language === 'pt' 
                                    ? 'https://flagcdn.com/24x18/gb.png' 
                                    : 'https://flagcdn.com/24x18/pt.png'}
                                alt={i18n.language === 'pt' ? 'EN' : 'PT'}
                                className="w-6 h-auto"
                            />
                        </button>

                        {/* Dark mode toggle */}
                        <button
                            onClick={onToggleDark}
                            className="text-xl px-2 py-1 rounded hover:bg-muted transition-colors text-foreground"
                            title={darkMode ? t('navbar.lightMode') : t('navbar.darkMode')}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>

                        {user ? (
                            <div className="hidden md:flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">👤 {user.username}</span>
                                <Button variant="outline" size="sm" className="text-foreground" onClick={onLogout}>
                                    {t('navbar.logout')}
                                </Button>
                            </div>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="hidden md:flex text-foreground"
                                onClick={() => setShowLoginModal(true)}
                            >
                                {t('navbar.login')}
                            </Button>
                        )}

                        {/* Hamburger mobile */}
                        <button
                            className="md:hidden text-2xl text-foreground"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>

                {/* Menu mobile */}
                {menuOpen && (
                    <div className="md:hidden mt-3 flex flex-col gap-2 px-2">
                        {links.map(link => (
                            <Button
                                key={link.path}
                                variant={location.pathname === link.path ? 'default' : 'ghost'}
                                className="w-full text-foreground"
                                onClick={() => { navigate(link.path); setMenuOpen(false); }}
                            >
                                {link.label}
                            </Button>
                        ))}
                        {user ? (
                            <>
                                <span className="text-sm text-muted-foreground text-center">👤 {user.username}</span>
                                <Button variant="outline" className="text-foreground" onClick={() => { onLogout(); setMenuOpen(false); }}>
                                    {t('navbar.logout')}
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" className="text-foreground" onClick={() => { setShowLoginModal(true); setMenuOpen(false); }}>
                                {t('navbar.login')}
                            </Button>
                        )}
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