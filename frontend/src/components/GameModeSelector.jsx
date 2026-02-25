import { Swiper, SwiperSlide } from 'swiper/react';
import { useTranslation } from 'react-i18next';
import { modes } from '../constants/gameModes';
import 'swiper/css';


function ModeCard({ mode, isMobile }) {
    const { t } = useTranslation();

    return (
        <div
            className={`
                relative text-center
                flex flex-col items-center justify-center
                transition-all duration-300
                ${isMobile ? 'p-4 gap-4' : 'p-5 py-6 gap-6'}
            `}
        >
            <img
                src={mode.image}
                alt={mode.key}
                className={`drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform duration-300 object-contain ${isMobile ? 'w-42 h-42' : 'w-52 h-52'} ${mode.available ? '' : 'opacity-85'}`}
            />

            <div>
                <h2 className={`font-extrabold tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${isMobile ? 'text-2xl' : 'text-3xl'} ${!mode.available ? 'text-primary/80' : 'text-primary'}`}>
                    {t(`landing.${mode.key}`)}
                </h2>
                <p className={`drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-sm ${!mode.available ? 'text-foreground/60' : 'text-foreground'}`}>
                    {t(`landing.${mode.key}Desc`)}
                </p>
            </div>
        </div>
    );
}

function GameModeSelector({ 
    selectedSeasonData,
    activeIndex,
    onModeChange,
    onPlayClick,
    onBack
}) {
    const { t } = useTranslation();
    const activeMode = modes[activeIndex];

    const handleSlideChange = (swiper) => {
        const newIndex = swiper.activeIndex;
        onModeChange(newIndex, modes[newIndex].path);
    };

    return (
        <div key="step2" className="animate-in fade-in slide-in-from-right duration-500 w-full flex flex-col items-center gap-8">
            {/* Botão Voltar */}
            <div className="w-full max-w-4xl">
                <button
                    onClick={onBack}
                    className="p-2 md:p-3 rounded-xl bg-primary hover:scale-105 transition-all duration-200"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
            </div>

            {/* Label da Liga Escolhida */}
            {selectedSeasonData && (
                <div className="flex items-center gap-4">
                    <img 
                        src={selectedSeasonData.logo} 
                        alt={selectedSeasonData.name} 
                        className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                    />
                    <span className="text-2xl md:text-3xl font-bold text-primary drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                        {selectedSeasonData.name}
                    </span>
                </div>
            )}

            {/* Desktop - Swiper */}
            <div className="hidden lg:block w-full max-w-4xl">
                <Swiper
                    spaceBetween={30}
                    slidesPerView={1}
                    centeredSlides={true}
                    onSlideChange={handleSlideChange}
                    initialSlide={activeIndex}
                    className="w-full"
                >
                    {modes.map(mode => (
                        <SwiperSlide key={mode.key}>
                            <ModeCard mode={mode} isMobile={false} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Mobile - Swiper */}
            <div className="lg:hidden w-full max-w-sm mx-auto">
                <Swiper
                    spaceBetween={20}
                    slidesPerView={1}
                    centeredSlides={true}
                    onSlideChange={handleSlideChange}
                    initialSlide={activeIndex}
                    className="w-full"
                >
                    {modes.map(mode => (
                        <SwiperSlide key={mode.key}>
                            <ModeCard mode={mode} isMobile={true} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Indicadores de navegação */}
            <div className="flex items-center gap-2">
                {modes.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === activeIndex
                                ? 'w-8 bg-primary'
                                : 'w-2 bg-muted-foreground/40'
                        }`}
                    />
                ))}
            </div>

            {/* Botão COMEÇAR */}
            <div className="w-full max-w-sm flex justify-center">
                {activeMode.available ? (
                    <button
                        onClick={onPlayClick}
                        className="px-8 py-3 rounded-full bg-primary text-background font-bold text-lg uppercase tracking-widest hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
                    >
                        {t('quiz.start') || 'COMEÇAR'}
                    </button>
                ) : (
                    <button
                        disabled
                        className="px-8 py-3 rounded-full border-2 border-primary text-muted-foreground font-bold text-lg uppercase tracking-widest cursor-not-allowed opacity-60"
                    >
                        🔒 {t('landing.comingSoon')}
                    </button>
                )}
            </div>
        </div>
    );
}

export default GameModeSelector;