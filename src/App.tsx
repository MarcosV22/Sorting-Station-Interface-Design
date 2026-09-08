import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import TutorialScreen from "./screens/TutorialScreen";
import GameScreen from "./screens/GameScreen";
import ResultScreen from "./screens/ResultScreen";

type Screen = "home" | "tutorial" | "game" | "result";

const PHASES: number[][] = [
  [5, 2, 4, 1],
  [6, 3, 8, 2, 5],
  [9, 1, 7, 4, 3, 6],
];

interface GameResult {
  comparisons: number;
  swaps: number;
  finalArray: number[];
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [phase, setPhase] = useState(1);
  const [result, setResult] = useState<GameResult | null>(null);

  const handleComplete = (comparisons: number, swaps: number, finalArray: number[]) => {
    setResult({ comparisons, swaps, finalArray });
    setScreen("result");
  };

  const handleNextPhase = () => {
    const next = Math.min(phase + 1, PHASES.length);
    setPhase(next);
    setResult(null);
    setScreen("game");
  };

  const handleRepeat = () => {
    setResult(null);
    setScreen("game");
  };

  const currentArray = PHASES[phase - 1] ?? PHASES[0];

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
          phase={phase}
          onNext={handleNextPhase}
          onRepeat={handleRepeat}
        />
      )}
    </div>
  );
}
