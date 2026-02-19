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

function ModeCard({ mode, onClick }) {
    const { t } = useTranslation();

    return (
        <div
            onClick={mode.available ? onClick : undefined}
            className={`
                relative p-8 text-center group
                py-10 flex flex-col items-center justify-center gap-4
                transition-all duration-300
                ${mode.available
                    ? 'cursor-pointer hover:scale-115'
                    : 'cursor-not-allowed'
                }
            `}
        >
            {mode.image
                ? <img
                    src={mode.image}
                    alt={mode.key}
                    className={`w-56 h-56 drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${!mode.available ? 'grayscale opacity-70' : ''}`}
                  />
                : <span
                    className={`text-9xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${!mode.available ? 'grayscale opacity-70' : ''}`}
                  >
                    {mode.icon}
                  </span>
            }

            <div className="space-y-2">
                <h2 className={`text-3xl font-extrabold tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${!mode.available ? 'text-primary/50' : 'text-primary'}`}>
                    {t(`landing.${mode.key}`)}
                </h2>
                <p className={`text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${!mode.available ? 'text-foreground/60' : 'text-foreground'}`}>
                    {t(`landing.${mode.key}Desc`)}
                </p>
            </div>

            {mode.available && (
                <button className="mt-2 px-8 py-3 rounded-full border-2 border-primary text-foreground font-bold text-sm uppercase tracking-widest group-hover:bg-primary group-hover:text-background transition-all duration-200">
                    {t('landing.playNow')} →
                </button>
            )}

            {!mode.available && (
                <span className="mt-2 px-8 py-3 rounded-full border-2 border-primary text-muted-foreground font-bold text-sm uppercase tracking-widest">
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
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 gap-10">

            {/* Desktop */}
            <div className="hidden lg:grid grid-cols-3 gap-6 w-full max-w-4xl">
                {modes.map(mode => (
                    <ModeCard
                        key={mode.key}
                        mode={mode}
                        onClick={() => navigate(mode.path)}
                    />
                ))}
            </div>

            {/* Mobile */}
            <div className="lg:hidden w-full flex flex-col items-center gap-4">
                <Swiper
                    spaceBetween={12}
                    slidesPerView={1.25}
                    centeredSlides={true}
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    className="w-full"
                >
                    {modes.map(mode => (
                        <SwiperSlide key={mode.key}>
                            <ModeCard
                                mode={mode}
                                onClick={() => navigate(mode.path)}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="flex items-center gap-2">
                    {modes.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${
                                i === activeIndex
                                    ? 'w-6 bg-primary'
                                    : 'w-3 bg-muted-foreground/40'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Landing;