import { useState, useCallback } from "react";
import NumberedBox from "../components/NumberedBox";
import StatsPanel from "../components/StatsPanel";
import InstructionPanel from "../components/InstructionPanel";
import PhaseHeader from "../components/PhaseHeader";
import GameButton from "../components/GameButton";

interface GameScreenProps {
  onComplete: (comparisons: number, swaps: number, finalArray: number[]) => void;
  initialArray?: number[];
  phase?: number;
}

const INITIAL_ARRAY = [5, 2, 4, 1];

export default function GameScreen({
  onComplete,
  initialArray = INITIAL_ARRAY,
  phase = 1,
}: GameScreenProps) {
  const [boxes, setBoxes] = useState<number[]>([...initialArray]);
  const [selected, setSelected] = useState<number | null>(null);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: "info" | "warning" | "success" | "error" }>({
    text: "Selecione duas caixas vizinhas para comparar.",
    type: "info",
  });
  const [animating, setAnimating] = useState<{ left: boolean; right: boolean } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintPair, setHintPair] = useState<[number, number] | null>(null);

  const isSorted = useCallback((arr: number[]) => {
    return arr.every((v, i) => i === 0 || arr[i - 1] <= v);
  }, []);

  const findNextSwap = (arr: number[]): [number, number] | null => {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) return [i, i + 1];
    }
    return null;
  };

  const handleBoxClick = (index: number) => {
    if (selected === null) {
      setSelected(index);
      setMessage({ text: `Caixa #${index + 1} selecionada. Selecione uma vizinha.`, type: "info" });
      return;
    }

    if (selected === index) {
      setSelected(null);
      setMessage({ text: "Seleção cancelada. Escolha uma caixa.", type: "info" });
      return;
    }

    // Check adjacency
    if (Math.abs(selected - index) !== 1) {
      setMessage({ text: "As caixas precisam ser vizinhas! Tente novamente.", type: "warning" });
      setSelected(null);
      return;
    }

    const left = Math.min(selected, index);
    const right = left + 1;
    const newComparisons = comparisons + 1;
    setComparisons(newComparisons);
    setSelected(null);
    setHintPair(null);

    if (boxes[left] > boxes[right]) {
      // Need to swap
      setAnimating({ left: true, right: false });
      setTimeout(() => {
        const newBoxes = [...boxes];
        [newBoxes[left], newBoxes[right]] = [newBoxes[right], newBoxes[left]];
        const newSwaps = swaps + 1;
        setBoxes(newBoxes);
        setSwaps(newSwaps);
        setAnimating(null);

        if (isSorted(newBoxes)) {
          setTimeout(() => onComplete(newComparisons, newSwaps, newBoxes), 400);
        } else {
          setMessage({ text: `Troca realizada! ${newBoxes[left]} < ${newBoxes[right]}. Continue.`, type: "success" });
        }
      }, 500);
    } else {
      setMessage({
        text: `${boxes[left]} ≤ ${boxes[right]} — sem troca necessária. Continue!`,
        type: "info",
      });
      if (isSorted(boxes)) {
        setTimeout(() => onComplete(newComparisons, swaps, boxes), 400);
      }
    }
  };

  const handleReset = () => {
    setBoxes([...initialArray]);
    setSelected(null);
    setComparisons(0);
    setSwaps(0);
    setMessage({ text: "Reiniciando... Selecione duas caixas vizinhas.", type: "info" });
    setAnimating(null);
    setHintPair(null);
    setShowHint(false);
  };

  const handleHint = () => {
    const pair = findNextSwap(boxes);
    if (pair) {
      setHintPair(pair);
      setShowHint(true);
      setMessage({
        text: `DICA: Compare as posições #${pair[0] + 1} e #${pair[1] + 1}.`,
        type: "warning",
      });
      setTimeout(() => {
        setHintPair(null);
        setShowHint(false);
      }, 3000);
    } else if (isSorted(boxes)) {
      setMessage({ text: "As caixas já estão ordenadas!", type: "success" });
    } else {
      setMessage({ text: "Nenhuma troca necessária neste passo. Continue comparando.", type: "info" });
    }
  };

  const sortedCount = boxes.reduce((acc, _, i) => {
    if (i === boxes.length - 1) return acc + 1;
    if (boxes[i] <= boxes[i + 1] && boxes.slice(i + 1).every((v, j, a) => j === 0 || a[j - 1] <= v)) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060b1a] bg-grid scanlines flex flex-col">
      {/* Header */}
      <PhaseHeader protocol="BUBBLE" phase={phase} totalPhases={3} />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-6">

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-64 bg-blue-600/4 rounded-full blur-[100px] pointer-events-none" />

        {/* Phase label */}
        <div className="relative z-10 text-center">
          <h2
            className="text-2xl font-bold text-white/80 tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            PROTOCOLO BUBBLE — FASE {phase}
          </h2>
          <p className="text-white/30 text-xs mt-1 tracking-widest"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            ORDENE AS CAIXAS EM ORDEM CRESCENTE
          </p>
        </div>

        {/* Conveyor + Boxes area */}
        <div className="relative z-10 w-full max-w-2xl">
          {/* Top rail */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mb-2" />

          {/* Conveyor label */}
          <div className="flex justify-between mb-3 px-2">
            <span className="text-[9px] text-white/20 tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              ESTEIRA A-04
            </span>
            <span className="text-[9px] text-white/20 tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              CAPACIDADE: {boxes.length}/8 PKG
            </span>
          </div>

          {/* Boxes row */}
          <div className="conveyor-track py-6 px-8 rounded-xl relative flex items-center justify-center gap-6">
            {/* Corner indicators */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-500/30" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-500/30" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-500/30" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-500/30" />

            {boxes.map((value, index) => (
              <NumberedBox
                key={`box-${index}`}
                value={value}
                index={index}
                selected={selected === index || hintPair?.includes(index) === true}
                disabled={false}
                sorted={isSorted(boxes.slice(0, index + 1)) && index >= boxes.length - sortedCount}
                onClick={handleBoxClick}
                animating={
                  animating
                    ? index === selected
                      ? "right"
                      : "left"
                    : null
                }
                size="lg"
              />
            ))}
          </div>

          {/* Direction arrow */}
          <div className="flex items-center justify-end gap-1 mt-2 px-2">
            <span className="text-[9px] text-white/15"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              DESTINO →
            </span>
          </div>

          {/* Bottom rail */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mt-2" />
        </div>

        {/* Instruction panel */}
        <div className="relative z-10 w-full max-w-2xl">
          <InstructionPanel message={message.text} type={message.type} />
        </div>

        {/* Bottom controls */}
        <div className="relative z-10 flex items-center justify-between w-full max-w-2xl">
          {/* Stats */}
          <StatsPanel comparisons={comparisons} swaps={swaps} />

          {/* Action buttons */}
          <div className="flex gap-3">
            <GameButton
              onClick={handleHint}
              variant="secondary"
              size="sm"
              disabled={showHint}
            >
              ? DICA
            </GameButton>
            <GameButton
              onClick={handleReset}
              variant="danger"
              size="sm"
            >
              ↺ REINICIAR
            </GameButton>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 w-full max-w-2xl">
          <div className="flex justify-between mb-1">
            <span className="text-[9px] text-white/20 tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              PROGRESSO
            </span>
            <span className="text-[9px] text-cyan-400/60"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              {Math.round((isSorted(boxes) ? 100 : (swaps / Math.max(swaps + 2, 4)) * 80))}%
            </span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
              style={{
                width: `${isSorted(boxes) ? 100 : Math.min((swaps / Math.max(swaps + 2, 4)) * 80, 85)}%`,
                boxShadow: "0 0 8px rgba(0,245,255,0.4)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
