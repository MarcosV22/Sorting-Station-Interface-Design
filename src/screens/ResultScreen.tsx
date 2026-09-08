import NumberedBox from "../components/NumberedBox";
import GameButton from "../components/GameButton";

interface ResultScreenProps {
  finalArray: number[];
  comparisons: number;
  swaps: number;
  phase: number;
  onNext: () => void;
  onRepeat: () => void;
}

const PSEUDO_CODE = [
  { line: "procedure bubbleSort(A: list)", indent: 0 },
  { line: "  n ← length(A)", indent: 1 },
  { line: "  for i ← 0 to n-1 do", indent: 1 },
  { line: "    for j ← 0 to n-i-2 do", indent: 2 },
  { line: "      if A[j] > A[j+1] then", indent: 3 },
  { line: "        swap(A[j], A[j+1])", indent: 4, highlight: true },
  { line: "      end if", indent: 3 },
  { line: "    end for", indent: 2 },
  { line: "  end for", indent: 1 },
  { line: "end procedure", indent: 0 },
];

export default function ResultScreen({
  finalArray,
  comparisons,
  swaps,
  phase,
  onNext,
  onRepeat,
}: ResultScreenProps) {
  const efficiency = swaps === 0 ? 100 : Math.max(20, Math.round(100 - swaps * 8));

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-center">
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
        <div className="w-full panel-border bg-[#080f28]/80 rounded-xl px-8 py-6">
          <p
            className="text-center text-[10px] text-white/30 tracking-widest mb-5"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            RESULTADO FINAL
          </p>
          <div className="flex items-center justify-center gap-5">
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

        {/* Stats + Pseudocode */}
        <div className="w-full grid grid-cols-2 gap-4">
          {/* Stats */}
          <div className="panel-border bg-[#0d1635]/60 rounded-xl p-5 flex flex-col gap-4">
            <span
              className="text-[10px] text-white/30 tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              RELATÓRIO DE DESEMPENHO
            </span>

            <div className="flex flex-col gap-3">
              {[
                { label: "Comparações", value: comparisons, color: "text-cyan-300" },
                { label: "Trocas", value: swaps, color: "text-purple-400" },
                { label: "Eficiência", value: `${efficiency}%`, color: efficiency > 70 ? "text-emerald-400" : "text-yellow-400" },
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

            {/* Efficiency bar */}
            <div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${efficiency > 70 ? "bg-emerald-500" : "bg-yellow-500"}`}
                  style={{
                    width: `${efficiency}%`,
                    boxShadow: `0 0 8px ${efficiency > 70 ? "rgba(52,211,153,0.5)" : "rgba(234,179,8,0.5)"}`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Pseudocode */}
          <div className="panel-border bg-[#080f28]/80 rounded-xl p-5 flex flex-col gap-3">
            <span
              className="text-[10px] text-white/30 tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PSEUDOCÓDIGO — BUBBLE SORT
            </span>
            <div className="flex flex-col gap-0.5">
              {PSEUDO_CODE.map((item, i) => (
                <div
                  key={i}
                  className={`px-2 py-0.5 rounded text-[10px] leading-relaxed
                    ${item.highlight ? "bg-cyan-950/50 text-cyan-300" : "text-white/40"}`}
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {item.line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <GameButton onClick={onRepeat} variant="secondary" size="md">
            ↺ REPETIR FASE
          </GameButton>
          <GameButton onClick={onNext} variant="primary" size="lg">
            PRÓXIMA FASE →
          </GameButton>
        </div>
      </div>
    </div>
  );
}
