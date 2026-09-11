import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import TutorialScreen from "./screens/TutorialScreen";
import GameScreen from "./screens/GameScreen";
import ResultScreen from "./screens/ResultScreen";
import CampaignCompleteScreen from "./screens/CampaignCompleteScreen";
import ReplayScreen from "./screens/ReplayScreen";
import { PhaseResult } from "./game/campaign/campaignSummary";
import type { PhaseCompleteData } from "./screens/GameScreen";
import type { StepRecord } from "./game/sorting/types";

type Screen =
  | "home"
  | "tutorial"
  | "game"
  | "result"
  | "replay"
  | "campaign-complete";

const PHASES: number[][] = [
  [5, 2, 4, 1],
  [6, 3, 8, 2, 5],
  [9, 1, 7, 4, 3, 6],
];

interface GameResult {
  comparisons: number;
  swaps: number;
  errors: number;
  hintsUsed: number;
  finalArray: number[];
  initialArray: number[];
  history: readonly StepRecord[];
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [phase, setPhase] = useState(1);
  const [result, setResult] = useState<GameResult | null>(null);
  const [phaseResults, setPhaseResults] = useState<PhaseResult[]>([]);

  const handleComplete = (data: PhaseCompleteData) => {
    setResult({ ...data });

    // Armazena e consolida em memória os resultados de cada fase para o resumo global
    setPhaseResults((prev) => {
      const filtered = prev.filter((r) => r.phase !== phase);
      return [...filtered, { phase, ...data }].sort(
        (a, b) => a.phase - b.phase
      );
    });

    setScreen("result");
  };

  const handleNextPhase = () => {
    if (phase < PHASES.length) {
      setPhase((prev) => prev + 1);
      setResult(null);
      setScreen("game");
    } else {
      setResult(null);
      setScreen("campaign-complete");
    }
  };

  const handleRepeat = () => {
    setResult(null);
    setScreen("game");
  };

  const handleReturnHome = () => {
    setScreen("home");
    setPhase(1);
    setResult(null);
    setPhaseResults([]);
  };

  const handleRestartProtocol = () => {
    setPhase(1);
    setResult(null);
    setPhaseResults([]);
    setScreen("game");
  };

  const currentArray = PHASES[phase - 1] ?? PHASES[0];
  const hasNextPhase = phase < PHASES.length;

  return (
    <div className="w-full h-full overflow-hidden">
      {screen === "home" && (
        <HomeScreen
          onStart={() => setScreen("tutorial")}
          onHowToPlay={() => setScreen("tutorial")}
        />
      )}
      {screen === "tutorial" && (
        <TutorialScreen
          onUnderstood={() => setScreen("game")}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "game" && (
        <GameScreen
          key={`game-phase-${phase}`}
          onComplete={handleComplete}
          initialArray={currentArray}
          phase={phase}
        />
      )}
      {screen === "result" && result && (
        <ResultScreen
          finalArray={result.finalArray}
          comparisons={result.comparisons}
          swaps={result.swaps}
          errors={result.errors}
          hintsUsed={result.hintsUsed}
          phase={phase}
          hasNextPhase={hasNextPhase}
          onNext={handleNextPhase}
          onRepeat={handleRepeat}
          onViewReplay={() => setScreen("replay")}
        />
      )}
      {screen === "replay" && result && (
        <ReplayScreen
          initialArray={result.initialArray}
          history={result.history}
          phase={phase}
          onBackToResult={() => setScreen("result")}
        />
      )}
      {screen === "campaign-complete" && (
        <CampaignCompleteScreen
          results={phaseResults}
          totalPhases={PHASES.length}
          onReturnHome={handleReturnHome}
          onRestartProtocol={handleRestartProtocol}
        />
      )}
    </div>
  );
}
