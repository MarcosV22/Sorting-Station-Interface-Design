interface PhaseHeaderProps {
  protocol: string;
  phase: number;
  totalPhases?: number;
}

export default function PhaseHeader({ protocol, phase, totalPhases = 3 }: PhaseHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full px-6 py-3 bg-[#080f28]/80 border-b border-cyan-500/10">
      {/* Left: protocol name */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f5ff]" />
        <span
          className="text-cyan-300 text-sm font-bold tracking-widest uppercase"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          PROTOCOLO {protocol}
        </span>
      </div>

      {/* Center: phase indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i + 1 < phase
                ? "w-6 bg-cyan-400/60"
                : i + 1 === phase
                  ? "w-8 bg-cyan-400 shadow-[0_0_6px_#00f5ff]"
                  : "w-6 bg-white/10"
            }`}
          />
        ))}
        <span
          className="ml-2 text-xs text-white/40 tracking-widest"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          FASE {phase}/{totalPhases}
        </span>
      </div>

      {/* Right: status */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span
          className="text-xs text-green-400/70 tracking-widest"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          SISTEMA ATIVO
        </span>
      </div>
    </div>
  );
}
