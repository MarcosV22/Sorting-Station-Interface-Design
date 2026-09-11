type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface GameButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export default function GameButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}: GameButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  };

  const variantClasses = {
    primary: "btn-primary text-white",
    secondary: "btn-secondary text-cyan-300",
    danger:
      "bg-transparent border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/70 transition-all duration-200",
    ghost:
      "bg-transparent border border-white/10 text-white/60 hover:text-white/90 hover:border-white/20 transition-all duration-200",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative font-mono font-bold tracking-widest uppercase rounded
        cursor-pointer select-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060b1a]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {children}
    </button>
  );
}
