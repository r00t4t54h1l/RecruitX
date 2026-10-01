import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

function GlassCard({
  children,
  className = "",
}: GlassCardProps) {
  return (
    <div
      className={`
        rounded-3xl
        border border-white/10
        bg-white/[0.045]
        shadow-[8px_8px_30px_rgba(0,0,0,0.25),-8px_-8px_30px_rgba(255,255,255,0.015)]
        backdrop-blur-xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default GlassCard;