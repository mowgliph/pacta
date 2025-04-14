import { cn } from "@/renderer/lib/utils";
import React from "react";

interface MicroInteractionProps {
  children: React.ReactNode;
  className?: string;
}

export const HoverElevation: React.FC<MicroInteractionProps> = ({ 
  children, 
  className 
}) => (
  <div className={cn(
    "transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg",
    className
  )}>
    {children}
  </div>
);

export const HoverScale: React.FC<MicroInteractionProps> = ({ 
  children, 
  className 
}) => (
  <div className={cn(
    "transition-transform duration-300 hover:scale-105",
    className
  )}>
    {children}
  </div>
);

export const HoverGlow: React.FC<MicroInteractionProps> = ({ 
  children, 
  className 
}) => (
  <div className={cn(
    "transition-all duration-300 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]",
    className
  )}>
    {children}
  </div>
);

export const HoverBounce: React.FC<MicroInteractionProps> = ({ 
  children, 
  className 
}) => (
  <div className={cn(
    "transition-transform duration-300 hover:translate-y-[-4px]",
    className
  )}>
    {children}
  </div>
);

export const HoverBackground: React.FC<MicroInteractionProps> = ({ 
  children, 
  className 
}) => (
  <div className={cn(
    "transition-colors duration-300 hover:bg-accent/50",
    className
  )}>
    {children}
  </div>
);