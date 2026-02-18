import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center space-y-6">
                <h1 className="text-4xl font-bold">⚽ Liga Portugal Quiz</h1>
                <p className="text-muted-foreground">
                    Consegues identificar os jogadores da Primeira Liga só pela foto?
                </p>
                
                <div className="space-y-3">
                    <Button 
                        size="lg" 
                        className="w-full"
                        onClick={() => navigate('/quiz')}
                    >
                        Jogar Agora
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/leaderboard')}
                    >
                        Ver Leaderboard
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export default Landing;