import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "./card";
import type { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({
  children,
  header,
  footer,
  className,
  delay = 0,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      <Card className="h-full">
        {header && <CardHeader>{header}</CardHeader>}
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </motion.div>
  );
}

export function AnimatedContainer({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  );
}
