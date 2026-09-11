import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import TutorialScreen from "./screens/TutorialScreen";
import GameScreen from "./screens/GameScreen";
import ResultScreen from "./screens/ResultScreen";
import CampaignCompleteScreen from "./screens/CampaignCompleteScreen";
import ReplayScreen from "./screens/ReplayScreen";
import ProtocolModeBriefingScreen from "./screens/ProtocolModeBriefingScreen";
import { PhaseResult } from "./game/campaign/campaignSummary";
import {
  loadGameProgress,
  recordPhaseCompletion,
  recordTutorialCompletion,
  isChallengeModeUnlocked,
  getInitialSessionRoute,
  type GameSaveSchema,
} from "./game/persistence";
import {
  CHALLENGE_SCENARIOS,
  type BubbleSortVariant,
} from "./game/sorting";
import {
  generateBubblePhaseArray,
  BUBBLE_CAMPAIGN_PHASE_LENGTHS,
  type SeedInput,
} from "./game/generation";
import { getBriefingForGameMode } from "./game/briefing";
import type { PhaseCompleteData } from "./screens/GameScreen";
import type { StepRecord } from "./game/sorting/types";

type Screen =
  | "home"
  | "tutorial"
  | "briefing"
  | "game"
  | "result"
  | "replay"
  | "campaign-complete";

type GameMode = "CAMPAIGN" | "CHALLENGE";

const TOTAL_PHASES = BUBBLE_CAMPAIGN_PHASE_LENGTHS.length;

interface GameResult {
  comparisons: number;
  swaps: number;
  errors: number;
  hintsUsed: number;
  finalArray: readonly number[];
  initialArray: readonly number[];
  history: readonly StepRecord[];
  score: number;
  elapsedTimeMs: number;
  variant?: BubbleSortVariant;
  earlyExitTriggered?: boolean;
  terminationPass?: number;
  seed?: SeedInput;
}

export default function App() {
  const [saveData, setSaveData] = useState<GameSaveSchema>(() =>
    loadGameProgress(undefined, TOTAL_PHASES)
  );
  const [gameMode, setGameMode] = useState<GameMode>("CAMPAIGN");
  const [challengeScenarioIndex, setChallengeScenarioIndex] = useState<number>(0);
  const [screen, setScreen] = useState<Screen>("home");
  const [briefingReturnScreen, setBriefingReturnScreen] =
    useState<"home" | "campaign-complete">("home");
  const [phase, setPhase] = useState<number>(1);
  const [campaignArray, setCampaignArray] = useState<readonly number[]>(() =>
    generateBubblePhaseArray(1).values
  );
  const [campaignSeed, setCampaignSeed] = useState<SeedInput>(() => "");
  const [result, setResult] = useState<GameResult | null>(null);
  const [phaseResults, setPhaseResults] = useState<PhaseResult[]>([]);

  const isChallengeUnlocked = isChallengeModeUnlocked(saveData, TOTAL_PHASES);

  const handleComplete = (data: PhaseCompleteData) => {
    setResult({
      ...data,
      seed: gameMode === "CAMPAIGN" ? campaignSeed : undefined,
    });

    if (gameMode === "CAMPAIGN") {
      // Armazena e consolida em memória os resultados de cada fase para o resumo global
      setPhaseResults((prev) => {
        const filtered = prev.filter((r) => r.phase !== phase);
        return [...filtered, { phase, ...data }].sort(
          (a, b) => a.phase - b.phase
        );
      });

      // Atualiza e persiste o progresso de longo prazo desacoplado e avalia recorde
      const updated = recordPhaseCompletion(
        saveData,
        phase,
        TOTAL_PHASES,
        undefined,
        {
          score: data.score,
          errors: data.errors,
          hintsUsed: data.hintsUsed,
          elapsedTimeMs: data.elapsedTimeMs,
        }
      );
      setSaveData(updated);
    }
    // No modo CHALLENGE, os resultados permanecem exclusivamente em memória nesta versão,
    // sem poluir o Schema v2 nem criar IDs artificiais.

    setScreen("result");
  };

  const handleTutorialUnderstood = () => {
    const updated = recordTutorialCompletion(
      saveData,
      undefined,
      TOTAL_PHASES
    );
    setSaveData(updated);
    const gen = generateBubblePhaseArray(1);
    setCampaignArray(gen.values);
    setCampaignSeed(gen.seed);
    setPhase(1);
    setResult(null);
    setPhaseResults([]);
    setScreen("game");
  };

  const handleNextPhase = () => {
    if (gameMode === "CHALLENGE") {
      if (challengeScenarioIndex < CHALLENGE_SCENARIOS.length - 1) {
        setChallengeScenarioIndex((prev) => prev + 1);
        setResult(null);
        setScreen("game");
      } else {
        setResult(null);
        setScreen("home");
      }
      return;
    }

    if (phase < TOTAL_PHASES) {
      const nextPhase = phase + 1;
      const gen = generateBubblePhaseArray(nextPhase);
      setCampaignArray(gen.values);
      setCampaignSeed(gen.seed);
      setPhase(nextPhase);
      setResult(null);
      setScreen("game");
    } else {
      setResult(null);
      setScreen("campaign-complete");
    }
  };

  const handleRepeat = () => {
    // Mantém estritamente o MESMO vetor e a MESMA seed da rodada
    setResult(null);
    setScreen("game");
  };

  const handleSelectCampaign = () => {
    setGameMode("CAMPAIGN");
    setBriefingReturnScreen("home");
    setScreen("briefing");
  };

  const handleSelectChallenge = (source: "home" | "campaign-complete" = "home") => {
    setGameMode("CHALLENGE");
    setChallengeScenarioIndex(0);
    setBriefingReturnScreen(source);
    setScreen("briefing");
  };

  const handleBriefingStart = () => {
    if (gameMode === "CAMPAIGN") {
      // A geração procedural da seed e do lote só ocorre no momento do clique no CTA do briefing
      const gen = generateBubblePhaseArray(1);
      setCampaignArray(gen.values);
      setCampaignSeed(gen.seed);
      const route = getInitialSessionRoute(saveData);
      setPhase(route.phase);
      setPhaseResults([]);
      setResult(null);
      setScreen(route.screen);
    } else {
      setChallengeScenarioIndex(0);
      setResult(null);
      setScreen("game");
    }
  };

  const handleReturnHome = () => {
    setGameMode("CAMPAIGN");
    setScreen("home");
    setPhase(1);
    setResult(null);
    setPhaseResults([]);
  };

  const handleRestartProtocol = () => {
    setGameMode("CAMPAIGN");
    setBriefingReturnScreen("campaign-complete");
    setScreen("briefing");
  };

  const activeScenario = CHALLENGE_SCENARIOS[challengeScenarioIndex];
  const currentArray =
    gameMode === "CHALLENGE"
      ? [...activeScenario.array]
      : campaignArray;
  const currentPhase =
    gameMode === "CHALLENGE" ? challengeScenarioIndex + 1 : phase;
  const currentTotalPhases =
    gameMode === "CHALLENGE" ? CHALLENGE_SCENARIOS.length : TOTAL_PHASES;
  const hasNextPhase =
    gameMode === "CHALLENGE"
      ? challengeScenarioIndex < CHALLENGE_SCENARIOS.length - 1
      : phase < TOTAL_PHASES;
  const canonicalComparisons =
    (currentArray.length * (currentArray.length - 1)) / 2;
  const activeVariant: BubbleSortVariant =
    gameMode === "CHALLENGE" ? "EARLY_EXIT" : "CANONICAL";

  return (
    <div className="w-full h-full overflow-hidden">
      {screen === "home" && (
        <HomeScreen
          onStart={handleSelectCampaign}
          onHowToPlay={() => setScreen("tutorial")}
          isChallengeUnlocked={isChallengeUnlocked}
          onStartChallenge={() => handleSelectChallenge("home")}
        />
      )}
      {screen === "briefing" && (
        <ProtocolModeBriefingScreen
          briefing={getBriefingForGameMode(gameMode)}
          onStart={handleBriefingStart}
          onBack={() => setScreen(briefingReturnScreen)}
        />
      )}
      {screen === "tutorial" && (
        <TutorialScreen
          onUnderstood={handleTutorialUnderstood}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "game" && (
        <GameScreen
          key={`${gameMode}-${currentPhase}-${gameMode === "CAMPAIGN" ? campaignSeed : ""}`}
          onComplete={handleComplete}
          initialArray={currentArray}
          phase={currentPhase}
          totalPhases={currentTotalPhases}
          variant={activeVariant}
          modeTitle={
            gameMode === "CHALLENGE"
              ? activeScenario.title
              : undefined
          }
        />
      )}
      {screen === "result" && result && (
        <ResultScreen
          finalArray={result.finalArray}
          comparisons={result.comparisons}
          swaps={result.swaps}
          errors={result.errors}
          hintsUsed={result.hintsUsed}
          score={result.score}
          elapsedTimeMs={result.elapsedTimeMs}
          phase={currentPhase}
          hasNextPhase={hasNextPhase}
          onNext={handleNextPhase}
          onRepeat={handleRepeat}
          onViewReplay={() => setScreen("replay")}
          variant={result.variant ?? activeVariant}
          earlyExitTriggered={result.earlyExitTriggered}
          terminationPass={result.terminationPass}
          canonicalComparisons={canonicalComparisons}
        />
      )}
      {screen === "replay" && result && (
        <ReplayScreen
          initialArray={result.initialArray}
          history={result.history}
          phase={currentPhase}
          variant={result.variant ?? activeVariant}
          earlyExitTriggered={result.earlyExitTriggered}
          onBackToResult={() => setScreen("result")}
        />
      )}
      {screen === "campaign-complete" && (
        <CampaignCompleteScreen
          results={phaseResults}
          totalPhases={TOTAL_PHASES}
          onReturnHome={handleReturnHome}
          onRestartProtocol={handleRestartProtocol}
          onStartChallenge={isChallengeUnlocked ? () => handleSelectChallenge("campaign-complete") : undefined}
        />
      )}
    </div>
  );
}
