import { useTranslation } from 'react-i18next';

function Loading() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
            <div className="flex flex-col items-center gap-4">
                <img 
                    src="/images/logo.png" 
                    alt="QuizDaBola" 
                    className="w-24 h-24 object-contain animate-bounce drop-shadow-2xl"
                />
                <div className="text-2xl font-bold text-primary animate-pulse">
                    {t('common.loading')}
                </div>
            </div>
        </div>
    );
}

export default Loading;