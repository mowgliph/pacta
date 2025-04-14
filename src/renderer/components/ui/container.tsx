import React from 'react';
import { cn } from "@/renderer/lib/utils";

interface ContainerProps {
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
}

export const Container: React.FC<ContainerProps> = ({ 
  className, 
  children, 
  as: Component = "div", 
  ...props 
}) => {
  return (
    <Component
      className={cn(
        "container mx-auto px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};