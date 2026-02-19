import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const modes = [
    {
        key: 'classic',
        icon: '🎯',
        path: '/quiz',
        available: true,
        gradient: 'from-blue-500/10 to-primary/5',
        borderHover: 'hover:border-primary hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    },
    {
        key: 'stats',
        icon: '📊',
        path: '/stats-quiz',
        available: true,
        gradient: 'from-orange-500/10 to-secondary/5',
        borderHover: '',
    },
    {
        key: 'results',
        icon: '🏟️',
        path: '/results',
        available: false,
        gradient: 'from-yellow-500/10 to-accent/5',
        borderHover: '',
    },
];

function ModeCard({ mode, onClick }) {
    const { t } = useTranslation();

    return (
        <div
            onClick={mode.available ? onClick : undefined}
            className={`
                relative rounded-2xl border p-8 text-center
                bg-gradient-to-br ${mode.gradient} bg-card
                h-72 flex flex-col items-center justify-center gap-4
                transition-all duration-300
                ${mode.available
                    ? `cursor-pointer ${mode.borderHover} hover:-translate-y-1 active:scale-95`
                    : 'opacity-50 cursor-not-allowed'
                }
            `}
        >
            {!mode.available && (
                <span className="absolute top-3 right-3 text-xs font-bold bg-muted text-muted-foreground px-2 py-1 rounded-full tracking-wide uppercase">
                    {t('landing.comingSoon')}
                </span>
            )}

            <span className="text-7xl drop-shadow-sm">{mode.icon}</span>

            <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                    {t(`landing.${mode.key}`)}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {t(`landing.${mode.key}Desc`)}
                </p>
            </div>

            {mode.available && (
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                    {t('landing.playNow')} →
                </span>
            )}
        </div>
    );
}

function Landing() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col items-center justify-center p-4 gap-10">

            {/* Header */}
            <div className="text-center space-y-3">
                <h1 className="text-5xl font-black text-foreground tracking-tight">
                    ⚽ QuizDaBola
                </h1>
                <div className="inline-flex items-center gap-2 bg-muted px-4 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <p className="text-muted-foreground text-sm font-semibold">
                        {t('landing.competition')}
                    </p>
                </div>
                <p className="text-muted-foreground text-base">
                    {t('landing.chooseMode')}
                </p>
            </div>

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

            {/* Mobile — swiper */}
            <div className="md:hidden w-full px-4">
                <Swiper
                    modules={[Pagination]}
                    spaceBetween={16}
                    slidesPerView={1.15}
                    centeredSlides={true}
                    pagination={{ clickable: true }}
                    className="pb-10"
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
            </div>
        </div>
    );
}

export default Landing;