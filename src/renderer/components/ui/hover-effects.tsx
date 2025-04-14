import React from 'react';
import { cn } from "@/renderer/lib/utils";

interface HoverEffectProps {
  children: React.ReactNode;
  className?: string;
  effect?: 'lift' | 'glow' | 'scale' | 'highlight';
}

export const HoverEffect: React.FC<HoverEffectProps> = ({
  children,
  className,
  effect = 'lift'
}) => {
  const effectClasses = {
    lift: "hover:-translate-y-1 transition-transform",
    glow: "hover:shadow-lg hover:shadow-primary/25 transition-shadow",
    scale: "hover:scale-105 transition-transform",
    highlight: "hover:bg-accent/10 transition-colors"
  };

  return (
    <div className={cn(effectClasses[effect], className)}>
      {children}
    </div>
  );
};

export default HoverEffect;