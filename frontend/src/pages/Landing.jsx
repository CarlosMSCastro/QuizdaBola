import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useState } from 'react';
import 'swiper/css';

const modes = [
    {
        key: 'classic',
        icon: null,
        image: '/images/classic.png',
        path: '/quiz',
        available: true,
    },
    {
        key: 'stats',
        icon: null,
        image: '/images/stats.png',
        path: '/stats-quiz',
        available: true,
    },
    {
        key: 'results',
        icon: null,
        image: '/images/results.png',
        path: '/results',
        available: false,
    },
];

function ModeCard({ mode, onClick, isMobile }) {
    const { t } = useTranslation();

    return (
        <div
            onClick={mode.available ? onClick : undefined}
            className={`
                relative text-center group
                flex flex-col items-center justify-center
                transition-all duration-300
                ${isMobile ? 'p-6 gap-4' : 'p-8 py-10 gap-4'}
                ${mode.available
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed'
                }
            `}
        >
            {mode.image
                ? <img
                    src={mode.image}
                    alt={mode.key}
                    className={`drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform duration-300 ${isMobile ? 'w-40 h-40 active:scale-110' : 'w-56 h-56 group-hover:scale-110'} ${!mode.available ? 'grayscale opacity-70' : ''}`}
                />
                : <span
                    className={`drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${isMobile ? 'text-6xl' : 'text-9xl'} ${!mode.available ? 'grayscale opacity-70' : ''}`}
                >
                    {mode.icon}
                </span>
            }

            <div className="space-y-2">
                <h2 className={`font-extrabold tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${isMobile ? 'text-2xl' : 'text-3xl'} ${!mode.available ? 'text-primary/50' : 'text-primary'}`}>
                    {t(`landing.${mode.key}`)}
                </h2>
                <p className={`drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${isMobile ? 'text-sm' : 'text-sm'} ${!mode.available ? 'text-foreground/60' : 'text-foreground'}`}>
                    {t(`landing.${mode.key}Desc`)}
                </p>
            </div>

            {mode.available && (
                <button className={`rounded-full border-2 border-primary text-foreground font-bold uppercase tracking-widest transition-all duration-200 mt-2 px-8 py-3 text-sm hover:bg-primary hover:text-background active:scale-95`}>
                    {t('landing.playNow')}
                </button>
            )}

            {!mode.available && (
                <span className={`rounded-full border-2 border-primary text-muted-foreground font-bold uppercase tracking-widest mt-2 px-8 py-3 text-sm`}>
                    🔒 {t('landing.comingSoon')}
                </span>
            )}
        </div>
    );
}

function Landing() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="min-h-[calc(100vh-20rem)] flex flex-col items-center justify-center p-4 gap-8">

            {/* Mobile Logo Title - Only below 560px */}
            <div className="min-[560px]:hidden flex justify-center">
                <img
                    src="/images/logo.png"
                    alt="QuizDaBola"
                    className="h-14 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-200 active:scale-95"
                    onClick={() => navigate('/')}
                />
            </div>

            {/* Desktop */}
            <div className="hidden lg:grid grid-cols-3 gap-6 w-full max-w-4xl">
                {modes.map(mode => (
                    <ModeCard
                        key={mode.key}
                        mode={mode}
                        onClick={() => navigate(mode.path)}
                        isMobile={false}
                    />
                ))}
            </div>

            {/* Mobile - Full width slides */}
            <div className="lg:hidden w-full max-w-sm mx-auto flex flex-col items-center gap-6">
                <Swiper
                    spaceBetween={20}
                    slidesPerView={1}
                    centeredSlides={true}
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    className="w-full"
                >
                    {modes.map(mode => (
                        <SwiperSlide key={mode.key}>
                            <ModeCard
                                mode={mode}
                                onClick={() => navigate(mode.path)}
                                isMobile={true}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

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
            </div>
        </div>
    );
}

export default Landing;