import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SeasonSelector from "../../shared/components/ui/SeasonSelector";
import GameModeSelector from "./GameModeSelector";
import { modes } from "../../shared/constants/gameModes";
import { getCompetition } from "../../shared/services/api";

function Landing() {
  const navigate = useNavigate();

  const [step, setStep] = useState(() => {
    return parseInt(localStorage.getItem("landingStep")) || 1;
  });

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
      navigate(activeMode.path);
    }
  };

  const handleBack = () => {
    setStep(1);
    localStorage.setItem("landingStep", "1");
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center p-4 gap-8 pt-16">
      {/* STEP 1: Escolher Liga */}
      {step === 1 && (
        <div
          key="step1"
          className="animate-in fade-in slide-in-from-left duration-500 w-full flex flex-col items-center gap-8"
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
