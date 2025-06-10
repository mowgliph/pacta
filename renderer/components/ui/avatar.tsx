import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../../lib/utils";
import { IconUser } from "@tabler/icons-react";

type AvatarSize = "sm" | "md" | "lg" | "xl" | "2xl";

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: AvatarSize;
  ring?: boolean;
  ringColor?: string;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
  "2xl": "h-24 w-24 text-xl"
};

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  ({ className, size = "md", ring = false, ringColor = "ring-primary", ...props }, ref) => {
    const sizeClass = sizeClasses[size];
    
    return (
      <div className={cn("relative inline-block", {
        [ringColor]: ring,
        "ring-2 ring-offset-2 rounded-full": ring,
      })}>
        <AvatarPrimitive.Root
          ref={ref}
          className={cn(
            "relative flex shrink-0 overflow-hidden rounded-full",
            "bg-muted text-muted-foreground",
            "transition-all duration-200 hover:opacity-90",
            sizeClass,
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  showLoadingIndicator?: boolean;
}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, showLoadingIndicator = true, ...props }, ref) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setError(false);
    props.onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setError(true);
    props.onError?.(e);
  };

  if (error) return null;

  return (
    <>
      {isLoading && showLoadingIndicator && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="h-1/2 w-1/2 animate-pulse rounded-full bg-muted-foreground/20" />
        </div>
      )}
      <AvatarPrimitive.Image
        ref={ref}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </>
  );
});
AvatarImage.displayName = "AvatarImage";

interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  icon?: React.ReactNode;
  showInitials?: boolean;
  name?: string;
}

const getInitials = (name?: string) => {
  if (!name) return null;
  const names = name.trim().split(/\s+/);
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
};

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, children, icon, showInitials = true, name, ...props }, ref) => {
  const content = children || (
    <>
      {icon || <IconUser className="h-1/2 w-1/2 text-muted-foreground" />}
      {showInitials && name && (
        <span className="font-medium text-muted-foreground">
          {getInitials(name)}
        </span>
      )}
    </>
  );

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        "select-none overflow-hidden",
        className
      )}
      {...props}
    >
      {content}
    </AvatarPrimitive.Fallback>
  );
});
AvatarFallback.displayName = "AvatarFallback";

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  children: React.ReactNode;
  spacing?: string;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 5, spacing = "-space-x-2", ...props }, ref) => {
    const avatars = React.Children.toArray(children);
    const total = avatars.length;
    const remaining = total - max;

    if (total === 0) return null;

    return (
      <div
        ref={ref}
        className={cn("flex items-center", spacing, className)}
        {...props}
      >
        {avatars.slice(0, max).map((child, index) => (
          <div key={index} className="inline-block">
            {child}
          </div>
        ))}
        {remaining > 0 && (
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            +{remaining}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup };

type AvatarComponent = typeof Avatar & {
  Image: typeof AvatarImage;
  Fallback: typeof AvatarFallback;
  Group: typeof AvatarGroup;
};

(Avatar as AvatarComponent).Image = AvatarImage;
(Avatar as AvatarComponent).Fallback = AvatarFallback;
(Avatar as AvatarComponent).Group = AvatarGroup;
