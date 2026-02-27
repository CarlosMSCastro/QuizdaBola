import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function BugReportButton() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
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

    const bugLabel = t('bugReport.foundBug');
    const suggestionLabel = t('bugReport.haveSuggestion');
    const ariaLabel = isFlipped ? suggestionLabel : bugLabel;

    return (
        <button
            onClick={handleClick}
            aria-label={ariaLabel}
            className="fixed lg:right-40 top-26 right-4 z-40 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
        >
            <div className="relative w-24 h-32 preserve-3d" style={{ perspective: '1000px' }}>
                {/* Container com flip horizontal */}
                <div 
                    className="relative w-full h-full transition-transform duration-700"
                    style={{ 
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                    aria-hidden="true"
                >
                    {/* Face da frente - Bug */}
                    <div 
                        className="absolute inset-0 flex flex-col items-center gap-2 group"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <img 
                            src="/images/bug.png" 
                            alt="" 
                            aria-hidden="true"
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
                            alt=""
                            aria-hidden="true"
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