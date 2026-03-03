import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslation } from "react-i18next";
import { modes } from "../../shared/constants/gameModes";
import { useRef } from "react";
import "swiper/css";

function ModeCard({ mode, isMobile }) {
  const { t } = useTranslation();

  return (
    <div
      className={`
        relative text-center
        flex flex-col items-center justify-center
        transition-all duration-300
        ${isMobile ? "p-4 gap-4" : "p-5 py-6 gap-6"}
      `}
    >
      <img
        src={mode.image}
        alt={mode.key}
        className={`drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform duration-300 object-contain ${isMobile ? "w-42 h-42" : "w-52 h-52"} ${mode.available ? "" : "opacity-85"}`}
      />

      <div>
        <h2
          className={`font-extrabold tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${isMobile ? "text-2xl" : "text-3xl"} ${!mode.available ? "text-primary/80" : "text-primary"}`}
        >
          {t(`landing.${mode.key}`)}
        </h2>
        <p
          className={`drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-sm ${!mode.available ? "text-foreground/60" : "text-foreground"}`}
        >
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
  onBack,
}) {
  const { t } = useTranslation();
  const activeMode = modes[activeIndex];
  const swiperDesktopRef = useRef(null);
  const swiperMobileRef = useRef(null);

  const handleSlideChange = (swiper) => {
    const newIndex = swiper.activeIndex;
    onModeChange(newIndex, modes[newIndex].path);
  };

  const handlePrevClickDesktop = () => {
    if (swiperDesktopRef.current && activeIndex > 0) {
      swiperDesktopRef.current.slidePrev();
    }
  };

  const handleNextClickDesktop = () => {
    if (swiperDesktopRef.current && activeIndex < modes.length - 1) {
      swiperDesktopRef.current.slideNext();
    }
  };

  const handlePrevClickMobile = () => {
    if (swiperMobileRef.current && activeIndex > 0) {
      swiperMobileRef.current.slidePrev();
    }
  };

  const handleNextClickMobile = () => {
    if (swiperMobileRef.current && activeIndex < modes.length - 1) {
      swiperMobileRef.current.slideNext();
    }
  };

  return (
    <div
      key="step2"
      className="animate-in fade-in slide-in-from-right duration-500 w-full flex flex-col items-center gap-6"
    >
      {/* Botão Voltar + Label da Liga - MESMA LINHA */}
      <div className="w-full max-w-4xl flex items-center justify-between px-4">
        <button
          onClick={onBack}
          className="p-2 md:p-3 rounded-xl bg-primary hover:scale-105 transition-all duration-200 flex-shrink-0"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>

        {selectedSeasonData && (
          <div className="flex items-center gap-3">
            <img
              src={selectedSeasonData.logo}
              alt={selectedSeasonData.name}
              className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            />
            <span className="text-xl md:text-2xl font-bold text-primary drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              {selectedSeasonData.name}
            </span>
          </div>
        )}
      </div>

      {/* Desktop - Swiper com Setas */}
      <div className="hidden lg:block w-full max-w-4xl">
        <div className="relative">
          {/* Botão Anterior - Desktop */}
          <button
            onClick={handlePrevClickDesktop}
            disabled={activeIndex === 0}
            aria-label={t("common.previous") || "Anterior"}
            className={`
              absolute left-0 top-1/2 -translate-y-1/2 z-10
              w-14 h-14 rounded-full
              bg-primary/40 backdrop-blur-sm
              flex items-center justify-center
              transition-all duration-200
              ${
                activeIndex === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-primary/60 hover:scale-110 active:scale-95"
              }
            `}
          >
            <svg
              className="w-7 h-7 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            centeredSlides={true}
            onSlideChange={handleSlideChange}
            onSwiper={(swiper) => (swiperDesktopRef.current = swiper)}
            initialSlide={activeIndex}
            className="w-full"
          >
            {modes.map((mode) => (
              <SwiperSlide key={mode.key}>
                <ModeCard mode={mode} isMobile={false} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Botão Próximo - Desktop */}
          <button
            onClick={handleNextClickDesktop}
            disabled={activeIndex === modes.length - 1}
            aria-label={t("common.next") || "Próximo"}
            className={`
              absolute right-0 top-1/2 -translate-y-1/2 z-10
              w-14 h-14 rounded-full
              bg-primary/40 backdrop-blur-sm
              flex items-center justify-center
              transition-all duration-200
              ${
                activeIndex === modes.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-primary/60 hover:scale-110 active:scale-95"
              }
            `}
          >
            <svg
              className="w-7 h-7 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile - Swiper com Setas */}
      <div className="lg:hidden w-full max-w-sm mx-auto">
        <div className="relative">
          {/* Botão Anterior - Mobile */}
          <button
            onClick={handlePrevClickMobile}
            disabled={activeIndex === 0}
            aria-label={t("common.previous") || "Anterior"}
            className={`
              absolute left-2 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full
              bg-primary/40 backdrop-blur-sm
              flex items-center justify-center
              transition-all duration-200
              ${
                activeIndex === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-primary/60 active:scale-90"
              }
            `}
          >
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <Swiper
            spaceBetween={20}
            slidesPerView={1}
            centeredSlides={true}
            onSlideChange={handleSlideChange}
            onSwiper={(swiper) => (swiperMobileRef.current = swiper)}
            initialSlide={activeIndex}
            className="w-full"
          >
            {modes.map((mode) => (
              <SwiperSlide key={mode.key}>
                <ModeCard mode={mode} isMobile={true} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Botão Próximo - Mobile */}
          <button
            onClick={handleNextClickMobile}
            disabled={activeIndex === modes.length - 1}
            aria-label={t("common.next") || "Próximo"}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full
              bg-primary/40 backdrop-blur-sm
              flex items-center justify-center
              transition-all duration-200
              ${
                activeIndex === modes.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-primary/60 active:scale-90"
              }
            `}
          >
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Indicadores de navegação */}
      <div className="flex items-center gap-2">
        {modes.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/40"
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
            {t("quiz.start") || "COMEÇAR"}
          </button>
        ) : (
          <button
            disabled
            className="px-8 py-3 rounded-full border-2 border-primary text-muted-foreground font-bold text-lg uppercase tracking-widest cursor-not-allowed opacity-60"
          >
            🔒 {t("landing.comingSoon")}
          </button>
        )}
      </div>
    </div>
  );
}

export default GameModeSelector;