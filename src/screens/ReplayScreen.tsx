import { useState, useEffect, useMemo } from "react";
import NumberedBox from "../components/NumberedBox";
import GameButton from "../components/GameButton";
import BubbleSortPseudocodePanel from "../components/BubbleSortPseudocodePanel";
import { buildReplayFrames, getReplayFrame } from "../game/replay";
import type { StepRecord } from "../game/sorting/types";

interface ReplayScreenProps {
  initialArray: number[];
  history: readonly StepRecord[];
  phase: number;
  onBackToResult: () => void;
}

export default function ReplayScreen({
  initialArray,
  history,
  phase,
  onBackToResult,
}: ReplayScreenProps) {
  // Derivação pura e determinística de todos os quadros a partir do histórico real
  const frames = useMemo(
    () => buildReplayFrames(initialArray, history),
    [initialArray, history]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentFrame = getReplayFrame(frames, currentIndex);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === frames.length - 1;

  // Autoplay da reprodução
  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < frames.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, 1200);

    return () => window.clearInterval(timer);
  }, [isPlaying, frames.length]);

  const handlePrevious = () => {
    setIsPlaying(false);
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleResetReplay = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (isLast) {
        // Se estiver no último quadro, reinicia do início e reproduz
        setCurrentIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const boxSize = initialArray.length >= 6 ? "md" : "lg";
  const progressPercent = Math.round(
    (currentFrame.stepNumber / Math.max(1, currentFrame.totalSteps)) * 100
  );

  return (
    <div className="relative w-full h-full min-h-full overflow-y-auto bg-[#060b1a] bg-grid scanlines flex flex-col justify-between p-4 md:p-6 gap-6">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between panel-border bg-[#080f28]/80 rounded-xl px-6 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <div className="flex flex-col">
            <span
              className="text-[10px] text-cyan-400 tracking-widest uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              AUDITORIA TÉCNICA // MODO REPLAY
            </span>
            <span
              className="text-lg font-black text-white tracking-tight"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              FASE {phase} — PROTOCOLO BUBBLE
            </span>
          </div>
        </div>

        <GameButton onClick={onBackToResult} variant="secondary" size="sm">
          ← VOLTAR AO RESULTADO
        </GameButton>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-5 max-w-4xl w-full mx-auto my-auto">
        {/* Step & Action Badge Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-bold text-white/50 tracking-wider px-3 py-1 rounded border border-white/10 bg-white/5"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PASSO {currentFrame.stepNumber} / {currentFrame.totalSteps}
            </span>

            {currentFrame.action === "INITIAL" && (
              <span
                className="text-xs font-bold text-cyan-300 tracking-wider px-3 py-1 rounded border border-cyan-500/30 bg-cyan-950/40"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ESTADO INICIAL
              </span>
            )}
            {currentFrame.action === "SWAP" && (
              <span
                className="text-xs font-bold text-purple-300 tracking-wider px-3 py-1 rounded border border-purple-500/30 bg-purple-950/40"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ⇄ TROCA REALIZADA (SWAP)
              </span>
            )}
            {currentFrame.action === "KEEP" && (
              <span
                className="text-xs font-bold text-emerald-300 tracking-wider px-3 py-1 rounded border border-emerald-500/30 bg-emerald-950/40"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                = ORDEM MANTIDA (KEEP)
              </span>
            )}
          </div>

          {currentFrame.action !== "INITIAL" && (
            <div
              className="flex items-center gap-4 text-xs text-white/60 mt-1"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              <span>
                Passada {currentFrame.passNumber}/{currentFrame.totalPasses}
              </span>
              <span>•</span>
              <span>
                Comparação {currentFrame.comparisonNumber}/{currentFrame.totalComparisonsInPass}
              </span>
              <span>•</span>
              <span className="text-white font-bold">
                {currentFrame.leftValue} {currentFrame.action === "SWAP" ? ">" : "≤"} {currentFrame.rightValue}
              </span>
            </div>
          )}
        </div>

        {/* Conveyor Belt Display */}
        <div className="w-full panel-border bg-[#080f28]/90 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl shadow-cyan-950/20">
          {/* Conveyor Visual Indicators */}
          <div className="w-full flex items-center justify-between text-[10px] text-white/30 tracking-widest px-2"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            <span>◄ POSIÇÃO 1</span>
            <span className="text-cyan-400/50">ESTEIRA DE TRIAGEM AUTOMATIZADA</span>
            <span>POSIÇÃO {initialArray.length} ►</span>
          </div>

          {/* Boxes with controlled horizontal scrolling */}
          <div className="w-full overflow-x-auto py-1">
            <div className="flex items-center justify-center gap-2.5 sm:gap-4 min-w-max mx-auto px-2">
              {currentFrame.values.map((value, index) => {
                const isActive =
                  currentFrame.activeIndices !== null &&
                  (index === currentFrame.activeIndices[0] ||
                    index === currentFrame.activeIndices[1]);

                const isSorted = currentFrame.sortedIndices.includes(index);

                return (
                  <NumberedBox
                    key={index}
                    value={value}
                    index={index}
                    selected={isActive}
                    disabled={false}
                    sorted={isSorted}
                    onClick={() => {}}
                    size={boxSize}
                  />
                );
              })}
            </div>
          </div>

          {/* Factual Explanation Callout */}
          <div className="w-full bg-[#0d1635]/80 border border-white/10 rounded-xl px-4 py-2.5 text-center">
            <p
              className="text-xs text-white/80 leading-relaxed"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {currentFrame.explanation}
            </p>
          </div>
        </div>

        {/* Synchronized Pseudocode Panel (P1.4) */}
        <BubbleSortPseudocodePanel frame={currentFrame} className="w-full" />

        {/* Replay Timeline Progress Bar */}
        <div className="w-full max-w-xl flex flex-col gap-1.5">
          <div
            className="flex justify-between items-center text-[10px] text-white/40"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span>PROGRESSO DA EXECUÇÃO</span>
            <span className="text-cyan-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 panel-border bg-[#080f28]/90 rounded-xl px-6 py-4 max-w-2xl w-full mx-auto shrink-0">
        <GameButton onClick={handleResetReplay} variant="secondary" size="sm">
          ↺ REINICIAR
        </GameButton>

        <GameButton
          onClick={handlePrevious}
          variant="secondary"
          size="md"
          disabled={isFirst}
        >
          ← ANTERIOR
        </GameButton>

        <GameButton
          onClick={handleTogglePlay}
          variant={isPlaying ? "danger" : "primary"}
          size="md"
        >
          {isPlaying ? "⏸ PAUSAR" : "▶ REPRODUZIR"}
        </GameButton>

        <GameButton
          onClick={handleNext}
          variant="secondary"
          size="md"
          disabled={isLast}
        >
          PRÓXIMO →
        </GameButton>
      </div>
    </div>
  );
}
