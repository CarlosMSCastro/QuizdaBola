import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useState, useRef } from 'react';
import 'swiper/css';

const seasons = [
    {
        key: 'ligaportugal2024',
        label: 'Liga Portugal 24/25',
        image: '/images/ligaportugal2024.png',
        available: true,
    },
    {
        key: 'ligaportugal2025',
        label: 'Liga Portugal 25/26',
        image: '/images/ligaportugal2025.png',
        available: false,
    },
    {
        key: 'championsleague',
        label: 'Champions 2024/25',
        image: '/images/championsleague.png',
        available: false,
    },
];

function SeasonSelector({ selectedSeason, onSeasonChange }) {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);
    const swiperRef = useRef(null);

    const handleSlideChange = (swiper) => {
        const newIndex = swiper.activeIndex;
        setActiveIndex(newIndex);
        
        // Se o slide for de uma season não disponível, volta para a disponível
        if (!seasons[newIndex].available) {
            setTimeout(() => {
                const availableIndex = seasons.findIndex(s => s.available);
                if (availableIndex !== -1 && swiperRef.current) {
                    swiperRef.current.slideTo(availableIndex);
                    onSeasonChange(seasons[availableIndex].key);
                }
            }, 1000); // Delay para mostrar o slide locked antes de voltar
        } else {
            onSeasonChange(seasons[newIndex].key);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-primary text-center">
                {t('quiz.selectSeason') || 'Escolhe a Competição'}
            </h2>

            {/* Desktop - Grid */}
            <div className="hidden md:grid grid-cols-3 gap-6">
                {seasons.map((season) => (
                    <button
                        key={season.key}
                        onClick={() => season.available && onSeasonChange(season.key)}
                        disabled={!season.available}
                        className={`
                            relative flex flex-col items-center gap-4 p-4 transition-all duration-300
                            ${season.available
                                ? selectedSeason === season.key
                                    ? 'scale-110'
                                    : 'hover:scale-105 active:scale-100'
                                : 'cursor-not-allowed opacity-50'
                            }
                        `}
                    >
                        <img
                            src={season.image}
                            alt={season.label}
                            className={`w-full h-36 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${!season.available ? 'grayscale' : ''}`}
                        />
                        
                        <span className={`text-base font-bold text-center ${
                            selectedSeason === season.key ? 'text-primary' : 'text-foreground'
                        }`}>
                            {season.label}
                        </span>

                        {!season.available && (
                            <span className="absolute top-2 right-2 px-3 py-1 rounded-full bg-primary/90 text-background text-xs font-bold backdrop-blur-sm">
                                🔒 {t('landing.comingSoon') || 'Em breve'}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Mobile - Swiper */}
            <div className="md:hidden w-full flex flex-col items-center gap-6">
                <Swiper
                    spaceBetween={20}
                    slidesPerView={1}
                    centeredSlides={true}
                    onSlideChange={handleSlideChange}
                    onSwiper={(swiper) => (swiperRef.current = swiper)}
                    className="w-full max-w-sm"
                >
                    {seasons.map((season) => (
                        <SwiperSlide key={season.key}>
                            <button
                                onClick={() => season.available && onSeasonChange(season.key)}
                                disabled={!season.available}
                                className={`
                                    relative flex flex-col items-center gap-4 p-6 w-full transition-all duration-300
                                    ${season.available
                                        ? 'active:scale-95'
                                        : 'cursor-not-allowed opacity-50'
                                    }
                                `}
                            >
                                <img
                                    src={season.image}
                                    alt={season.label}
                                    className={`w-full h-40 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${!season.available ? 'grayscale' : ''}`}
                                />
                                
                                <span className={`text-lg font-bold text-center ${
                                    selectedSeason === season.key ? 'text-primary' : 'text-foreground'
                                }`}>
                                    {season.label}
                                </span>

                                {!season.available && (
                                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/90 text-background text-xs font-bold backdrop-blur-sm">
                                        🔒 {t('landing.comingSoon') || 'Em breve'}
                                    </span>
                                )}
                            </button>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Indicators */}
                <div className="flex items-center gap-2">
                    {seasons.map((_, i) => (
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
            </div>
        </div>
    );
}

export default SeasonSelector;