import { useState, useEffect } from "react";
import GameButton from "../components/GameButton";

interface TutorialScreenProps {
  onUnderstood: () => void;
  onBack: () => void;
}

export default function TutorialScreen({ onUnderstood, onBack }: TutorialScreenProps) {
  const [step, setStep] = useState<"before" | "comparing" | "after">("before");

  useEffect(() => {
    const cycle = () => {
      setStep("comparing");
      setTimeout(() => setStep("after"), 900);
      setTimeout(() => setStep("before"), 2200);
    };
    const interval = setInterval(cycle, 3000);
    cycle();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-72 bg-purple-600/6 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl w-full px-8">

        {/* Back button */}
        <div className="w-full flex justify-start">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs tracking-widest"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            ← VOLTAR
          </button>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-purple-500/20 bg-purple-950/20 mb-4">
            <span className="text-[10px] text-purple-400 tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              TUTORIAL — ALGORITMO 01
            </span>
          </div>
          <h2
            className="text-4xl font-black tracking-tight text-white"
            style={{ fontFamily: "'Orbitron', sans-serif", textShadow: "0 0 30px rgba(139,92,246,0.4)" }}
          >
            PROTOCOLO BUBBLE
          </h2>
        </div>

        {/* Description card */}
        <div className="w-full panel-border bg-[#0d1635]/60 rounded-xl p-6">
          <p
            className="text-white/70 text-sm leading-relaxed text-center"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            No <span className="text-cyan-300">Bubble Sort</span>, dois elementos vizinhos são comparados.
            <br />
            Se o elemento da <span className="text-yellow-300">esquerda</span> for{" "}
            <span className="text-red-400">maior</span> que o da{" "}
            <span className="text-yellow-300">direita</span>, eles trocam de posição.
          </p>
        </div>

        {/* Animation area */}
        <div className="w-full panel-border bg-[#080f28]/80 rounded-xl p-8">
          <div className="text-center mb-6">
            <span
              className="text-[10px] text-white/30 tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              SIMULAÇÃO AO VIVO
            </span>
          </div>

          <div className="flex flex-col items-center gap-6">
            {/* Boxes animation */}
            <div className="flex items-center gap-6 justify-center">

              {/* Box 8 / 3 */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`
                    w-24 h-24 rounded-xl flex flex-col items-center justify-center relative
                    transition-all duration-300
                    ${step === "after" ? "bg-emerald-950 border-2 border-emerald-500/60" : "bg-[#0f1e4a] border-2 border-[#2a4a9e]"}
                    ${step === "comparing" ? "border-cyan-400 bg-cyan-950" : ""}
                  `}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-xl" />
                  <span
                    className={`text-4xl font-bold transition-colors duration-300
                      ${step === "after" ? "text-emerald-300" : step === "comparing" ? "text-cyan-200" : "text-white"}`}
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {step === "after" ? 3 : 8}
                  </span>
                  <span
                    className="text-[9px] text-white/20 absolute bottom-2"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {step === "after" ? "OK" : "PKG"}
                  </span>
                </div>
                {step === "comparing" && (
                  <div className="text-[10px] text-red-400 animate-pulse"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
                    MAIOR ▼
                  </div>
                )}
              </div>

              {/* Arrow indicator */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300
                    ${step === "comparing" ? "border-yellow-500/60 bg-yellow-950/30" : "border-white/10 bg-transparent"}
                  `}
                >
                  <span
                    className={`text-lg transition-all duration-300 ${step === "comparing" ? "text-yellow-400" : "text-white/20"}`}
                  >
                    {step === "after" ? "✓" : "⇄"}
                  </span>
                </div>
                <span
                  className={`text-[9px] tracking-wider transition-colors duration-300
                    ${step === "comparing" ? "text-yellow-400" : step === "after" ? "text-emerald-400" : "text-white/20"}`}
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {step === "before" ? "AGUARDANDO" : step === "comparing" ? "COMPARANDO" : "TROCADO!"}
                </span>
              </div>

              {/* Box 3 / 8 */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`
                    w-24 h-24 rounded-xl flex flex-col items-center justify-center relative
                    transition-all duration-300
                    ${step === "after" ? "bg-[#0f1e4a] border-2 border-[#2a4a9e]" : "bg-[#0f1e4a] border-2 border-[#2a4a9e]"}
                    ${step === "comparing" ? "border-cyan-400 bg-cyan-950" : ""}
                  `}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-xl" />
                  <span
                    className={`text-4xl font-bold transition-colors duration-300
                      ${step === "comparing" ? "text-cyan-200" : "text-white"}`}
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {step === "after" ? 8 : 3}
                  </span>
                  <span
                    className="text-[9px] text-white/20 absolute bottom-2"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    PKG
                  </span>
                </div>
                {step === "comparing" && (
                  <div className="text-[10px] text-cyan-400 animate-pulse"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
                    MENOR ▲
                  </div>
                )}
              </div>
            </div>

            {/* Step labels */}
            <div className="flex gap-8 justify-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${step === "before" ? "bg-cyan-400 shadow-[0_0_6px_#00f5ff]" : "bg-white/10"}`}
                />
                <span className="text-[9px] text-white/30" style={{ fontFamily: "'Space Mono', monospace" }}>ANTES</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${step === "comparing" ? "bg-yellow-400 shadow-[0_0_6px_#eab308]" : "bg-white/10"}`}
                />
                <span className="text-[9px] text-white/30" style={{ fontFamily: "'Space Mono', monospace" }}>COMPARANDO</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${step === "after" ? "bg-emerald-400 shadow-[0_0_6px_#4ade80]" : "bg-white/10"}`}
                />
                <span className="text-[9px] text-white/30" style={{ fontFamily: "'Space Mono', monospace" }}>APÓS TROCA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rule cards */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div className="panel-border bg-[#0d1635]/40 rounded-lg p-4 flex flex-col gap-2">
            <span className="text-cyan-400 text-xs tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>REGRA 01</span>
            <p className="text-white/60 text-xs leading-relaxed"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              Selecione dois elementos <span className="text-white/90">vizinhos</span> para compará-los.
            </p>
          </div>
          <div className="panel-border bg-[#0d1635]/40 rounded-lg p-4 flex flex-col gap-2">
            <span className="text-purple-400 text-xs tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>REGRA 02</span>
            <p className="text-white/60 text-xs leading-relaxed"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              Troque se o da <span className="text-white/90">esquerda &gt; direita</span>. Repita até ordenar.
            </p>
          </div>
        </div>

        {/* CTA */}
        <GameButton onClick={onUnderstood} variant="primary" size="lg" className="min-w-[240px]">
          ✓ &nbsp; ENTENDI
        </GameButton>
      </div>
    </div>
  );
}
