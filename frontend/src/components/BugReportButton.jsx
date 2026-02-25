import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function BugReportButton() {
    const navigate = useNavigate();
    const location = useLocation();
    const { i18n } = useTranslation();
    const lang = i18n.language === 'pt' ? 'pt' : 'en';
    const [isFlipped, setIsFlipped] = useState(false);

    // Só mostrar na Landing (/) e NUNCA na página de bug report
    const shouldShow = location.pathname === '/' && location.pathname !== '/bug-report';

    // Flip automático a cada 3 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setIsFlipped(prev => !prev);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    if (!shouldShow) return null;

    const handleClick = () => {
        navigate('/bug-report', { 
            state: { fromPage: location.pathname } 
        });
    };

    const bugLabel = lang === 'pt' ? 'Encontrou um bug?' : 'Found a bug?';
    const suggestionLabel = lang === 'pt' ? 'Tem uma sugestão?' : 'Have a suggestion?';

    return (
        <button
            onClick={handleClick}
            className="fixed lg:right-40 top-26 right-4 z-40 hover:scale-105 active:scale-95 transition-all duration-200"
            title={isFlipped ? suggestionLabel : bugLabel}
        >
            <div className="relative w-24 h-32 preserve-3d" style={{ perspective: '1000px' }}>
                {/* Container com flip horizontal */}
                <div 
                    className="relative w-full h-full transition-transform duration-700"
                    style={{ 
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                >
                    {/* Face da frente - Bug */}
                    <div 
                        className="absolute inset-0 flex flex-col items-center gap-2 group"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <img 
                            src="/images/bug.png" 
                            alt="Bug Report" 
                            className="w-18 md:w-22 drop-shadow-2xl"
                        />
                        <span className="text-[10px] md:text-sm font-bold text-foreground group-hover:text-primary group-hover:drop-shadow-lg transition-all whitespace-nowrap">
                            {bugLabel}
                        </span>
                    </div>

                    {/* Face de trás - Suggestion */}
                    <div 
                        className="absolute inset-0 flex flex-col items-center gap-1 group"
                        style={{ 
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        <img 
                            src="/images/suggestion.png" 
                            alt="Suggestion" 
                            className="w-18 md:w-22 drop-shadow-2xl"
                        />
                        <span className="text-[10px] md:text-sm font-bold text-foreground group-hover:text-primary group-hover:drop-shadow-lg transition-all whitespace-nowrap">
                            {suggestionLabel}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
}

export default BugReportButton;