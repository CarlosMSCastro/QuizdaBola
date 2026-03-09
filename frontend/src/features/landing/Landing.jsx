import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SeasonSelector from "./SeasonSelector";
import GameModeSelector from "./GameModeSelector";
import { modes } from "../../shared/constants/gameModes";
import { getCompetition } from "../../shared/services/api";

function Landing({ user }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [selectedSeason, setSelectedSeason] = useState(() => {
    return localStorage.getItem("selectedSeason") || "ligaportugal2024";
  });

  const [selectedSeasonData, setSelectedSeasonData] = useState(null);

  const [activeIndex, setActiveIndex] = useState(() => {
    const savedMode = localStorage.getItem("lastMode");
    const index = modes.findIndex((m) => m.path === savedMode);
    return index !== -1 ? index : 0;
  });

  useEffect(() => {
    const fetchSeasonData = async () => {
      if (step === 2 && selectedSeason && !selectedSeasonData) {
        try {
          const data = await getCompetition(selectedSeason);
          setSelectedSeasonData(data);
        } catch (error) {
          console.error("Erro ao buscar dados da liga:", error);
        }
      }
    };

    fetchSeasonData();
  }, [step, selectedSeason, selectedSeasonData]);

  // Flip automático do botão bug
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipped(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Modal de boas-vindas — uma vez por sessão
  useEffect(() => {
    const seen = sessionStorage.getItem("welcomeModalSeen");
    if (!seen) {
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
        sessionStorage.setItem("welcomeModalSeen", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSeasonConfirm = (seasonId, seasonData) => {
    setSelectedSeason(seasonId);
    setSelectedSeasonData(seasonData);
    setStep(2);
    localStorage.setItem("landingStep", "2");
  };

  const handleModeChange = (index, path) => {
    setActiveIndex(index);
    localStorage.setItem("lastMode", path);
  };

  const handlePlayClick = () => {
    const activeMode = modes[activeIndex];
    if (activeMode.available) {
      localStorage.setItem("selectedSeason", selectedSeason);
      localStorage.setItem("lastMode", activeMode.path);
      sessionStorage.setItem('quiz-navigation', 'true');
      navigate(activeMode.path);
    }
  };

  const handleBack = () => {
    setStep(1);
    localStorage.setItem("landingStep", "1");
  };

  const handleBugClick = () => {
    navigate('/bug-report');
  };

  const bugLabel = t('bugReport.foundBug');
  const suggestionLabel = t('bugReport.haveSuggestion');

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center p-3 gap-4 pt-5 relative">

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border-2 border-primary p-8 space-y-5 animate-in fade-in zoom-in duration-300">

            {/* Logo */}
            <div className="flex justify-center">
              <img src="/images/logo.png" alt="QuizDaBola" className="h-16 object-contain" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-primary tracking-tight">
                {t("welcome.title")}
              </h2>
              <p className="text-muted-foreground text-base">
                {t("welcome.subtitle")}
              </p>
            </div>

            <p className="text-foreground text-sm leading-relaxed">
              {t("welcome.body")}
            </p>

            <p className="text-sm text-foreground leading-relaxed">
              {t("welcome.bugIntro")}{" "}
              <button
                onClick={() => { setShowWelcomeModal(false); navigate('/bug-report'); }}
                className="text-primary font-bold underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                {t("welcome.bugLink")}
              </button>
              .
            </p>

            {!user && (
              <p className="text-sm text-foreground leading-relaxed">
                {t("welcome.registerIntro")}{" "}
                <button
                  onClick={() => { setShowWelcomeModal(false); navigate('/login?mode=register'); }}
                  className="text-primary font-bold underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  {t("welcome.registerLink")}
                </button>
                {" "}{t("welcome.registerOutro")}
              </p>
            )}

            <button
              onClick={() => setShowWelcomeModal(false)}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {t("welcome.close")}
            </button>
          </div>
        </div>
      )}

      {/* Bug/Suggestion Button - SÓ DESKTOP, CANTO SUPERIOR DIREITO */}
      <button
        onClick={handleBugClick}
        aria-label={isFlipped ? suggestionLabel : bugLabel}
        className="hidden md:block absolute top-12 right-8 lg:right-16 xl:right-44 2xl:right-96 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
      >
        <div className="relative w-36 h-40" style={{ perspective: '1000px' }}>
          <div
            className="relative w-full h-full transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Bug Face */}
            <div
              className="absolute inset-0 flex flex-col items-center gap-1 group"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <img
                src="/images/bug.png"
                alt=""
                className="w-20 drop-shadow-xl opacity-90 transition-opacity"
              />
              <span className="text-[10px] font-bold text-primary transition-colors whitespace-nowrap">
                {bugLabel}
              </span>
            </div>

            {/* Suggestion Face */}
            <div
              className="absolute inset-0 flex flex-col items-center gap-1 group"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <img
                src="/images/suggestion.png"
                alt=""
                className="w-20 drop-shadow-xl opacity-90 transition-opacity"
              />
              <span className="text-[10px] font-bold text-primary transition-colors whitespace-nowrap">
                {suggestionLabel}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* STEP 1: Escolher Liga */}
      {step === 1 && (
        <div
          key="step1"
          className="animate-in fade-in slide-in-from-left duration-500 w-full flex flex-col items-center gap-5"
        >
          <SeasonSelector
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
            onConfirm={handleSeasonConfirm}
          />
        </div>
      )}

      {/* STEP 2: Escolher Modo */}
      {step === 2 && (
        <GameModeSelector
          selectedSeasonData={selectedSeasonData}
          activeIndex={activeIndex}
          onModeChange={handleModeChange}
          onPlayClick={handlePlayClick}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default Landing;