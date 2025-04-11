import React from 'react';
import { cn } from "@/renderer/lib/utils";

export function Container({ className, children, as: Component = "div", ...props }) {
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
}