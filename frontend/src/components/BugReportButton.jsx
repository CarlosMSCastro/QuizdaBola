import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function BugReportButton() {
    const navigate = useNavigate();
    const location = useLocation();
    const { i18n } = useTranslation();
    const lang = i18n.language === 'pt' ? 'pt' : 'en';

    // Só mostrar na Landing (/) e NUNCA na página de bug report
    const shouldShow = location.pathname === '/' && location.pathname !== '/bug-report';

    if (!shouldShow) return null;

    const handleClick = () => {
        navigate('/bug-report', { 
            state: { fromPage: location.pathname } 
        });
    };

    const label = lang === 'pt' ? 'Encontrou um bug?' : 'Found a bug?';

    return (
        <button
            onClick={handleClick}
            className="fixed lg:right-40 top-28 right-4 z-40 flex flex-col md:flex-row items-center md:gap-2 hover:scale-105 active:scale-95 transition-all duration-200 group"
            title={label}
        >
            <img 
                src="/images/bug.png" 
                alt="Bug Report" 
                className="w-18  md:w-22  drop-shadow-2xl"
            />
            <span className="text-[10px] md:text-sm font-bold text-foreground group-hover:text-primary group-hover:drop-shadow-lg transition-all whitespace-nowrap">
                {label}
            </span>
        </button>
    );
}

export default BugReportButton;