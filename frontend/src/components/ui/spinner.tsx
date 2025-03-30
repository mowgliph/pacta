import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  'inline-block animate-spin rounded-full border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-[3px]',
        lg: 'h-12 w-12 border-4',
        xl: 'h-16 w-16 border-4',
      },
      variant: {
        primary: 'text-primary',
        secondary: 'text-secondary',
        destructive: 'text-destructive',
        muted: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        role="status"
        aria-label="Cargando"
        {...props}
      >
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export interface FullPageSpinnerProps extends SpinnerProps {
  message?: string;
}

export const FullPageSpinner: React.FC<FullPageSpinnerProps> = ({
  message = 'Cargando...',
  size = 'lg',
  variant = 'primary',
  className,
  ...props
}) => {
  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-background bg-opacity-80">
      <Spinner size={size} variant={variant} className={className} {...props} />
      {message && (
        <p className="mt-4 text-lg font-medium text-foreground">{message}</p>
      )}
    </div>
  );
};

FullPageSpinner.displayName = 'FullPageSpinner'; 