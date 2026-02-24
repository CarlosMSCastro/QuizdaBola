import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TestAnimations() {
    const navigate = useNavigate();
    const [activeAnimation, setActiveAnimation] = useState('fade-in');
    const [key, setKey] = useState(0);

    const animations = [
        { id: 'fade-in', name: 'Fade In', class: 'animate-in fade-in duration-500' },
        { id: 'slide-right', name: 'Slide da Direita', class: 'animate-in slide-in-from-right duration-500' },
        { id: 'slide-left', name: 'Slide da Esquerda', class: 'animate-in slide-in-from-left duration-500' },
        { id: 'slide-bottom', name: 'Slide de Baixo', class: 'animate-in slide-in-from-bottom duration-500' },
        { id: 'slide-top', name: 'Slide de Cima', class: 'animate-in slide-in-from-top duration-500' },
        { id: 'zoom-in', name: 'Zoom In', class: 'animate-in zoom-in duration-500' },
        { id: 'fade-slide-bottom', name: 'Fade + Slide Baixo', class: 'animate-in fade-in slide-in-from-bottom duration-500' },
        { id: 'fade-slide-right', name: 'Fade + Slide Direita', class: 'animate-in fade-in slide-in-from-right duration-500' },
        { id: 'fade-zoom', name: 'Fade + Zoom', class: 'animate-in fade-in zoom-in duration-500' },
    ];

    const triggerAnimation = (animId) => {
        setActiveAnimation(animId);
        setKey(prev => prev + 1); // Force re-render para replay
    };

    const currentAnim = animations.find(a => a.id === activeAnimation);

    return (
        <div className="min-h-screen p-8 bg-background">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-3 rounded-xl bg-primary hover:scale-105 transition-all"
                    >
                        <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-4xl font-black text-primary">
                        🎨 Test Animations
                    </h1>
                </div>

                {/* Controls */}
                <div className="bg-card/50 rounded-2xl p-6 space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Escolhe uma animação:</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {animations.map(anim => (
                            <button
                                key={anim.id}
                                onClick={() => triggerAnimation(anim.id)}
                                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                                    activeAnimation === anim.id
                                        ? 'bg-primary text-background'
                                        : 'bg-muted hover:bg-muted/70 text-foreground'
                                }`}
                            >
                                {anim.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview Area */}
                <div className="bg-muted/30 rounded-2xl p-12 min-h-[400px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-4 left-4 text-sm text-muted-foreground font-mono">
                        className="{currentAnim?.class}"
                    </div>
                    
                    {/* Animated Element */}
                    <div
                        key={key}
                        className={`${currentAnim?.class} bg-gradient-to-br from-primary to-primary/70 rounded-3xl p-12 shadow-2xl`}
                    >
                        <div className="text-center space-y-4">
                            <div className="text-6xl">⚽</div>
                            <h3 className="text-3xl font-black text-white">
                                QuizDaBola
                            </h3>
                            <p className="text-white/80 text-lg">
                                {currentAnim?.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Example: Page Transition Simulation */}
                <div className="bg-card/50 rounded-2xl p-6 space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Simular transições de página:</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => triggerAnimation('fade-slide-bottom')}
                            className="p-6 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold hover:scale-105 transition-all"
                        >
                            📄 Landing → Quiz
                            <div className="text-xs opacity-70 mt-1">Fade + Slide Baixo</div>
                        </button>
                        <button
                            onClick={() => triggerAnimation('slide-right')}
                            className="p-6 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white font-bold hover:scale-105 transition-all"
                        >
                            ❓ Próxima Pergunta
                            <div className="text-xs opacity-70 mt-1">Slide Direita</div>
                        </button>
                        <button
                            onClick={() => triggerAnimation('fade-zoom')}
                            className="p-6 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white font-bold hover:scale-105 transition-all"
                        >
                            💀 Game Over
                            <div className="text-xs opacity-70 mt-1">Fade + Zoom</div>
                        </button>
                    </div>
                </div>

                {/* Code Example */}
                <div className="bg-card/50 rounded-2xl p-6 space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Como usar:</h2>
                    <pre className="bg-black/50 text-green-400 p-4 rounded-xl overflow-x-auto text-sm">
{`// No componente:
<div className="${currentAnim?.class}">
  <Quiz />
</div>

// Ou em qualquer elemento:
<button className="${currentAnim?.class}">
  Clica aqui
</button>`}
                    </pre>
                </div>
            </div>
        </div>
    );
}

export default TestAnimations;