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
        icon: '🏟️',
        image: null,
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
                h-96 flex flex-col items-center justify-center gap-4
                transition-all duration-300
                ${mode.available
                    ? 'cursor-pointer hover:-translate-y-2 active:scale-95'
                    : 'opacity-40 cursor-not-allowed'
                }
            `}
        >
            {!mode.available && (
                <span className="absolute top-3 right-3 text-xs font-bold bg-white/20 text-white px-2 py-1 rounded-full tracking-wide uppercase">
                    {t('landing.comingSoon')}
                </span>
            )}

            {mode.image
                ? <img src={mode.image} alt={mode.key} className="w-48 h-48 drop-shadow-lg" />
                : <span className="text-9xl drop-shadow-lg">{mode.icon}</span>
            }

            <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                    {t(`landing.${mode.key}`)}
                </h2>
                <p className="text-white/75 text-sm drop-shadow">
                    {t(`landing.${mode.key}Desc`)}
                </p>
            </div>

            {mode.available && (
                <button className="mt-2 px-8 py-3 rounded-full border-2 border-white text-white font-bold text-sm uppercase tracking-widest group-hover:bg-white group-hover:text-green-700 transition-all duration-200">
                    {t('landing.playNow')} →
                </button>
            )}
        </div>
    );
}

function Landing() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col items-center justify-center p-4 gap-10">

            {/* Desktop */}
            <div className="hidden md:grid grid-cols-3 gap-6 w-full max-w-4xl">
                {modes.map(mode => (
                    <ModeCard
                        key={mode.key}
                        mode={mode}
                        onClick={() => navigate(mode.path)}
                    />
                ))}
            </div>

            {/* Mobile */}
            <div className="md:hidden w-full flex flex-col items-center gap-4">
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

                {/* Indicador minimalista */}
                <div className="flex items-center gap-2">
                    {modes.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${
                                i === activeIndex
                                    ? 'w-6 bg-white'
                                    : 'w-3 bg-white/40'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Landing;