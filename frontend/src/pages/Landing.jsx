import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function Landing() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center space-y-6">
                <h1 className="text-4xl font-bold text-foreground">⚽ {t('landing.title')}</h1>
                <p className="text-muted-foreground">
                    {t('landing.subtitle')}
                </p>
                
                <div className="space-y-3">
                    <Button 
                        size="lg" 
                        className="w-full"
                        onClick={() => navigate('/quiz')}
                    >
                        {t('landing.playNow')}
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        className="w-full text-foreground"
                        onClick={() => navigate('/leaderboard')}
                    >
                        {t('landing.leaderboard')}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export default Landing;