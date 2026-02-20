import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useState, useRef, useEffect } from 'react';
import { getCompetitions } from '../services/api';
import 'swiper/css';

function SeasonSelector({ selectedSeason, onSeasonChange }) {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const swiperRef = useRef(null);

    useEffect(() => {
        // Buscar TODAS as competições (ativas e inativas)
        const fetchCompetitions = async () => {
            try {
                const data = await getCompetitions();
                setCompetitions(data);
                
                // Definir índice inicial baseado na competição selecionada
                const selectedIndex = data.findIndex(c => c.id === selectedSeason);
                if (selectedIndex !== -1) {
                    setActiveIndex(selectedIndex);
                }
            } catch (error) {
                console.error('Erro ao buscar competições:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompetitions();
    }, [selectedSeason]);

    const handleSlideChange = (swiper) => {
        const newIndex = swiper.activeIndex;
        setActiveIndex(newIndex);
        
        const competition = competitions[newIndex];
        
        // Se for inativa, volta para a ativa após 1 segundo
        if (competition && !competition.active) {
            setTimeout(() => {
                const activeIndex = competitions.findIndex(c => c.active);
                if (activeIndex !== -1 && swiperRef.current) {
                    swiperRef.current.slideTo(activeIndex);
                    onSeasonChange(competitions[activeIndex].id);
                }
            }, 1000);
        } else if (competition) {
            onSeasonChange(competition.id);
        }
    };

    const handleCompetitionClick = (competition) => {
        if (competition.active) {
            onSeasonChange(competition.id);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-8">
                <p className="text-lg text-foreground">{t('common.loading') || 'A carregar...'}</p>
            </div>
        );
    }

    if (competitions.length === 0) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-8">
                <p className="text-lg text-muted-foreground">Nenhuma competição disponível</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-primary text-center">
                {t('quiz.selectSeason') || 'Escolhe a Competição'}
            </h2>

            {/* Desktop - Grid */}
            <div className="hidden md:grid grid-cols-3 gap-6">
                {competitions.map((competition) => (
                    <button
                        key={competition.id}
                        onClick={() => handleCompetitionClick(competition)}
                        disabled={!competition.active}
                        className={`
                            relative flex flex-col items-center gap-4 p-4 transition-all duration-300
                            ${competition.active
                                ? selectedSeason === competition.id
                                    ? 'scale-110'
                                    : 'hover:scale-105 active:scale-100'
                                : 'cursor-not-allowed opacity-50'
                            }
                        `}
                    >
                        <img
                            src={competition.logo}
                            alt={competition.name}
                            className={`w-full h-36 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${
                                !competition.active ? 'grayscale' : ''
                            }`}
                        />
                        
                        <span className={`text-base font-bold text-center ${
                            selectedSeason === competition.id ? 'text-primary' : 'text-foreground'
                        }`}>
                            {competition.name}
                        </span>

                        {!competition.active && (
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
                    initialSlide={activeIndex}
                    className="w-full max-w-sm"
                >
                    {competitions.map((competition) => (
                        <SwiperSlide key={competition.id}>
                            <button
                                onClick={() => handleCompetitionClick(competition)}
                                disabled={!competition.active}
                                className={`
                                    relative flex flex-col items-center gap-4 p-6 w-full transition-all duration-300
                                    ${competition.active
                                        ? 'active:scale-95'
                                        : 'cursor-not-allowed opacity-50'
                                    }
                                `}
                            >
                                <img
                                    src={competition.logo}
                                    alt={competition.name}
                                    className={`w-full h-40 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${
                                        !competition.active ? 'grayscale' : ''
                                    }`}
                                />
                                
                                <span className={`text-lg font-bold text-center ${
                                    selectedSeason === competition.id ? 'text-primary' : 'text-foreground'
                                }`}>
                                    {competition.name}
                                </span>

                                {!competition.active && (
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
                    {competitions.map((_, i) => (
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