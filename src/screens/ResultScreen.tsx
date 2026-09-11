import NumberedBox from "../components/NumberedBox";
import GameButton from "../components/GameButton";
import { BUBBLE_SORT_PSEUDOCODE } from "../game/replay/replayPseudocode";

interface ResultScreenProps {
  finalArray: number[];
  comparisons: number;
  swaps: number;
  errors: number;
  hintsUsed: number;
  phase: number;
  hasNextPhase?: boolean;
  onNext: () => void;
  onRepeat: () => void;
  onViewReplay?: () => void;
}

export default function ResultScreen({
  finalArray,
  comparisons,
  swaps,
  errors,
  hintsUsed,
  phase,
  hasNextPhase = true,
  onNext,
  onRepeat,
  onViewReplay,
}: ResultScreenProps) {
  return (
    <div className="relative w-full h-full min-h-full overflow-y-auto bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start sm:justify-center p-4 sm:p-8">
      {/* Glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-3xl w-full px-8">

        {/* Success badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400/10 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="relative w-16 h-16 rounded-full border-2 border-emerald-500/60 bg-emerald-950/50 flex items-center justify-center">
              <span className="text-2xl text-emerald-400">✓</span>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-emerald-500/20 bg-emerald-950/20 mb-3">
              <span className="text-[10px] text-emerald-400 tracking-widest"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                FASE {phase} CONCLUÍDA
              </span>
            </div>
            <h2
              className="text-4xl font-black text-white tracking-tight"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                textShadow: "0 0 30px rgba(52,211,153,0.4)",
              }}
            >
              ORDENAÇÃO
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400">
                CONCLUÍDA!
              </span>
            </h2>
          </div>
        </div>

        {/* Final array */}
        <div className="w-full panel-border bg-[#080f28]/80 rounded-xl px-4 sm:px-8 py-5">
          <p
            className="text-center text-[10px] text-white/30 tracking-widest mb-4 uppercase"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            VETOR RESULTANTE CONSOLIDADO
          </p>
          <div className="w-full overflow-x-auto py-1">
            <div className="flex items-center justify-center gap-2.5 sm:gap-4 min-w-max mx-auto px-2">
              {finalArray.map((value, index) => (
                <NumberedBox
                  key={index}
                  value={value}
                  index={index}
                  selected={false}
                  disabled={false}
                  sorted={true}
                  onClick={() => {}}
                  size="md"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats + Pseudocode */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stats */}
          <div className="panel-border bg-[#0d1635]/60 rounded-xl p-5 flex flex-col gap-4">
            <span
              className="text-[10px] text-white/30 tracking-widest uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              MÉTRICAS DA FASE
            </span>

            <div className="flex flex-col gap-3">
              {[
                { label: "Comparações", value: comparisons, color: "text-cyan-300" },
                { label: "Trocas", value: swaps, color: "text-purple-400" },
                {
                  label: "Decisões Incorretas",
                  value: errors,
                  color: errors > 0 ? "text-amber-400" : "text-white/60",
                },
                {
                  label: "Dicas Utilizadas",
                  value: hintsUsed,
                  color: hintsUsed > 0 ? "text-cyan-400" : "text-white/60",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between items-center">
                  <span
                    className="text-xs text-white/40"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {stat.label}
                  </span>
                  <span
                    className={`text-lg font-bold ${stat.color}`}
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pseudocode */}
          <div className="panel-border bg-[#080f28]/80 rounded-xl p-5 flex flex-col gap-3">
            <span
              className="text-[10px] text-white/30 tracking-widest uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PSEUDOCÓDIGO — BUBBLE SORT
            </span>
            <div className="flex flex-col gap-0.5">
              {BUBBLE_SORT_PSEUDOCODE.map((item) => (
                <div
                  key={item.id}
                  className={`px-2 py-0.5 rounded text-[10px] leading-relaxed ${
                    item.id === "SWAP_STATEMENT" ? "bg-cyan-950/40 text-cyan-300" : "text-white/40"
                  }`}
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    paddingLeft: `${Math.max(8, item.indent * 12 + 8)}px`,
                  }}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {onViewReplay && (
            <GameButton onClick={onViewReplay} variant="secondary" size="md">
              ▶ VER EXECUÇÃO
            </GameButton>
          )}
          <GameButton onClick={onRepeat} variant="secondary" size="md">
            ↺ REPETIR FASE
          </GameButton>
          <GameButton onClick={onNext} variant="primary" size="lg">
            {hasNextPhase ? "PRÓXIMA FASE →" : "CONCLUIR PROTOCOLO →"}
          </GameButton>
        </div>
      </div>
    </div>
  );
}
