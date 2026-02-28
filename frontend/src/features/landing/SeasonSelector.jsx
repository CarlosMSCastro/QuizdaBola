import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { useState, useRef, useEffect } from "react";
import { getCompetitions } from "../../shared/services/api";
import "swiper/css";

function SeasonSelector({ selectedSeason, onSeasonChange, onConfirm }) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperDesktopRef = useRef(null);
  const swiperMobileRef = useRef(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const data = await getCompetitions();
        setCompetitions(data);

        const selectedIndex = data.findIndex((c) => c.id === selectedSeason);
        if (selectedIndex !== -1) {
          setActiveIndex(selectedIndex);
        }
      } catch (error) {
        console.error("Erro ao buscar competições:", error);
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
    if (competition) {
      onSeasonChange(competition.id);
    }
  };

  const handlePrevClickDesktop = () => {
    if (swiperDesktopRef.current && activeIndex > 0) {
      swiperDesktopRef.current.slidePrev();
    }
  };

  const handleNextClickDesktop = () => {
    if (swiperDesktopRef.current && activeIndex < competitions.length - 1) {
      swiperDesktopRef.current.slideNext();
    }
  };

  const handlePrevClickMobile = () => {
    if (swiperMobileRef.current && activeIndex > 0) {
      swiperMobileRef.current.slidePrev();
    }
  };

  const handleNextClickMobile = () => {
    if (swiperMobileRef.current && activeIndex < competitions.length - 1) {
      swiperMobileRef.current.slideNext();
    }
  };

  const handleConfirm = () => {
    const competition = competitions[activeIndex];
    if (competition && competition.active && onConfirm) {
      onConfirm(competition.id, competition);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-8">
        <p className="text-lg text-foreground">
          {t("common.loading") || "A carregar..."}
        </p>
      </div>
    );
  }

  if (competitions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-8">
        <p className="text-lg text-muted-foreground">
          Nenhuma competição disponível
        </p>
      </div>
    );
  }

  const activeCompetition = competitions[activeIndex];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl md:text-3xl font-bold text-primary text-center">
        {t("quiz.selectSeason") || "Escolhe a Competição"}
      </h2>

      {/* Desktop - Swiper com Setas */}
      <div className="hidden md:block w-full">
        <div className="relative max-w-2xl mx-auto">
          {/* Botão Anterior - Desktop */}
          <button
            onClick={handlePrevClickDesktop}
            disabled={activeIndex === 0}
            aria-label={t("common.previous") || "Anterior"}
            className={`
              absolute left-0 top-1/2 -translate-y-1/2 z-10
              w-12 h-12 rounded-full
              bg-primary/20 backdrop-blur-sm
              flex items-center justify-center
              transition-all duration-200
              ${
                activeIndex === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-primary/40 hover:scale-110 active:scale-95"
              }
            `}
          >
            <svg
              className="w-6 h-6 text-primary"
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
            {competitions.map((competition) => (
              <SwiperSlide key={competition.id}>
                <div
                  className={`
                    relative flex flex-col items-center gap-4 p-8 transition-all duration-300
                    ${competition.active ? "" : "opacity-50"}
                  `}
                >
                  <img
                    src={competition.logo}
                    alt={competition.name}
                    className={`w-full h-48 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]`}
                  />

                  <span
                    className={`text-2xl font-bold text-center ${
                      !competition.active
                        ? "text-foreground/50"
                        : "text-foreground"
                    }`}
                  >
                    {competition.name}
                  </span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Botão Próximo - Desktop */}
          <button
            onClick={handleNextClickDesktop}
            disabled={activeIndex === competitions.length - 1}
            aria-label={t("common.next") || "Próximo"}
            className={`
              absolute right-0 top-1/2 -translate-y-1/2 z-10
              w-12 h-12 rounded-full
              bg-primary/20 backdrop-blur-sm
              flex items-center justify-center
              transition-all duration-200
              ${
                activeIndex === competitions.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-primary/40 hover:scale-110 active:scale-95"
              }
            `}
          >
            <svg
              className="w-6 h-6 text-primary"
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

      {/* Mobile - Swiper com Setas Mini */}
      <div className="md:hidden w-full">
        <div className="relative max-w-sm mx-auto">
          {/* Botão Anterior - Mobile Mini */}
          <button
            onClick={handlePrevClickMobile}
            disabled={activeIndex === 0}
            aria-label={t("common.previous") || "Anterior"}
            className={`
              absolute left-2 top-1/2 -translate-y-1/2 z-10
              w-8 h-8 rounded-full
              bg-primary/20 backdrop-blur-sm
              flex items-center justify-center
              transition-all duration-200
              ${
                activeIndex === 0
                  ? "opacity-20 cursor-not-allowed"
                  : "hover:bg-primary/40 active:scale-90"
              }
            `}
          >
            <svg
              className="w-4 h-4 text-primary"
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
            {competitions.map((competition) => (
              <SwiperSlide key={competition.id}>
                <div
                  className={`
                    relative flex flex-col items-center gap-4 p-6 transition-all duration-300
                    ${competition.active ? "" : "opacity-70"}
                  `}
                >
                  <img
                    src={competition.logo}
                    alt={competition.name}
                    className={`w-full h-40 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]`}
                  />

                  <span
                    className={`text-lg font-bold text-center ${
                      !competition.active
                        ? "text-foreground/50"
                        : "text-foreground"
                    }`}
                  >
                    {competition.name}
                  </span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Botão Próximo - Mobile Mini */}
          <button
            onClick={handleNextClickMobile}
            disabled={activeIndex === competitions.length - 1}
            aria-label={t("common.next") || "Próximo"}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2 z-10
              w-8 h-8 rounded-full
              bg-primary/20 backdrop-blur-sm
              flex items-center justify-center
              transition-all duration-200
              ${
                activeIndex === competitions.length - 1
                  ? "opacity-20 cursor-not-allowed"
                  : "hover:bg-primary/40 active:scale-90"
              }
            `}
          >
            <svg
              className="w-4 h-4 text-primary"
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

      {/* Indicators */}
      <div className="flex items-center justify-center gap-2">
        {competitions.map((_, i) => (
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

      {/* Botão JOGAR AGORA */}
      <div className="w-full max-w-sm mx-auto flex justify-center">
        {activeCompetition && activeCompetition.active ? (
          <button
            onClick={handleConfirm}
            className="px-8 py-3 rounded-full bg-primary text-background font-bold text-lg uppercase tracking-widest hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
          >
            {t("landing.playNow") || "JOGAR AGORA"}
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

export default SeasonSelector;
