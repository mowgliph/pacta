import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from "@/renderer/lib/utils";

interface SkeletonProps extends Omit<HTMLMotionProps<"div">, "children"> {
  className?: string;
  children?: React.ReactNode;
}

interface SkeletonTableProps extends SkeletonProps {
  rows?: number;
  columns?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', children, ...props }) => {
  return (
    <motion.div
      className={cn("animate-pulse bg-muted rounded-md", className)}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 0.8 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const SkeletonCard: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={cn("p-4 space-y-3", className)}>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const SkeletonList: React.FC<SkeletonProps & { count?: number }> = ({ 
  count = 3, 
  className = '' 
}) => (
  <div className={cn("space-y-4", className)}>
    {[...Array(count)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={cn("space-y-4", className)}>
    <div className="grid grid-cols-4 gap-4">
      {[...Array(columns)].map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-6" />
      ))}
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={`row-${i}`} className="grid grid-cols-4 gap-4">
        {[...Array(columns)].map((_, j) => (
          <Skeleton key={`cell-${i}-${j}`} className="h-8" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonChart: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={cn("space-y-4", className)}>
    <Skeleton className="h-4 w-1/3" />
    <div className="flex items-end space-x-2 h-40">
      {[...Array(6)].map((_, i) => (
        <Skeleton 
          key={i} 
          className="h-full w-8" 
          style={{ height: `${Math.random() * 100}%` }} 
        />
      ))}
    </div>
  </div>
);

export default Skeleton;