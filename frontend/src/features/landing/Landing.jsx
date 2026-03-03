import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SeasonSelector from "./SeasonSelector";
import GameModeSelector from "./GameModeSelector";
import { modes } from "../../shared/constants/gameModes";
import { getCompetition } from "../../shared/services/api";

function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);

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
      {/* Bug/Suggestion Button - SÓ DESKTOP, CANTO SUPERIOR DIREITO */}
      <button
        onClick={handleBugClick}
        aria-label={isFlipped ? suggestionLabel : bugLabel}
        className="hidden md:block absolute top-12 right-8 lg:right-16 xl:right-24 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
      >
        <div className="relative w-32 h-36" style={{ perspective: '1000px' }}>
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
                className="w-18 drop-shadow-xl opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <span className="text-[9px] font-bold text-muted-foreground group-hover:text-primary transition-colors whitespace-nowrap">
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
                className="w-18 drop-shadow-xl opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors whitespace-nowrap">
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