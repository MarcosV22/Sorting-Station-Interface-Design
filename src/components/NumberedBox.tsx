interface NumberedBoxProps {
  value: number;
  index: number;
  selected: boolean;
  disabled: boolean;
  sorted?: boolean;
  onClick: (index: number) => void;
  animating?: "left" | "right" | null;
  size?: "sm" | "md" | "lg";
}

export default function NumberedBox({
  value,
  index,
  selected,
  disabled,
  sorted = false,
  onClick,
  animating = null,
  size = "lg",
}: NumberedBoxProps) {
  const sizeMap = {
    sm: { box: "w-16 h-16", text: "text-2xl", label: "text-xs" },
    md: { box: "w-20 h-20", text: "text-3xl", label: "text-xs" },
    lg: { box: "w-28 h-28", text: "text-4xl", label: "text-xs" },
  };

  const s = sizeMap[size];

  const animClass =
    animating === "left"
      ? "animate-swap-left"
      : animating === "right"
        ? "animate-swap-right"
        : "";

  return (
    <div
      className={`relative flex flex-col items-center gap-1 ${animClass}`}
    >
      {/* Box number label above */}
      <span
        className="text-white/30 font-mono"
        style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px" }}
      >
        #{index + 1}
      </span>

      <button
        onClick={() => !disabled && onClick(index)}
        disabled={disabled}
        className={`
          relative ${s.box} rounded-lg flex flex-col items-center justify-center
          transition-all duration-200 cursor-pointer select-none
          ${selected
            ? "bg-cyan-950 animate-pulse-border"
            : sorted
              ? "bg-emerald-950 box-glow-idle border border-emerald-500/30"
              : disabled
                ? "bg-slate-900/50 box-glow-disabled cursor-not-allowed opacity-50"
                : "bg-[#0f1e4a] box-glow-idle hover:bg-[#162460] hover:scale-105"
          }
        `}
        style={{
          border: selected
            ? "2px solid #00f5ff"
            : sorted
              ? undefined
              : "1px solid rgba(42,74,158,0.8)",
        }}
      >
        {/* Inner highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-lg" />

        {/* Value */}
        <span
          className={`${s.text} font-bold ${
            selected
              ? "text-cyan-300 glow-cyan"
              : sorted
                ? "text-emerald-400"
                : "text-white"
          }`}
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          {value}
        </span>

        {/* Bottom label */}
        <span
          className={`absolute bottom-1.5 text-[9px] font-mono tracking-widest ${
            selected ? "text-cyan-400" : sorted ? "text-emerald-500/60" : "text-white/20"
          }`}
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {selected ? "SEL" : sorted ? "OK" : "PKG"}
        </span>
      </button>
    </div>
  );
}
