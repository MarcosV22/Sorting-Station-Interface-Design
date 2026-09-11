interface InstructionPanelProps {
  message: string;
  type?: "info" | "warning" | "success" | "error";
}

const typeConfig = {
  info: {
    border: "border-cyan-500/20",
    bg: "bg-cyan-950/30",
    icon: "◈",
    iconColor: "text-cyan-400",
    textColor: "text-cyan-200/80",
  },
  warning: {
    border: "border-yellow-500/20",
    bg: "bg-yellow-950/20",
    icon: "⚠",
    iconColor: "text-yellow-400",
    textColor: "text-yellow-200/80",
  },
  success: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-950/30",
    icon: "✓",
    iconColor: "text-emerald-400",
    textColor: "text-emerald-200/80",
  },
  error: {
    border: "border-red-500/20",
    bg: "bg-red-950/20",
    icon: "✕",
    iconColor: "text-red-400",
    textColor: "text-red-200/80",
  },
};

export default function InstructionPanel({ message, type = "info" }: InstructionPanelProps) {
  const cfg = typeConfig[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 px-4 py-3 rounded border ${cfg.border} ${cfg.bg}`}
    >
      <span className={`text-base ${cfg.iconColor} flex-shrink-0`}>{cfg.icon}</span>
      <span
        className={`text-sm ${cfg.textColor}`}
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        {message}
      </span>
    </div>
  );
}
