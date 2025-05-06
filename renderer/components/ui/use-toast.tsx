import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "./toast";

type ToastOptions = {
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive" | "warning" | "info";
};

type ToastContextType = {
  toast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast debe usarse dentro de ToastProviderCustom");
  return context;
};

export const ToastProviderCustom: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    setToasts((prev) => [...prev, options]);
    setTimeout(() => setToasts((prev) => prev.slice(1)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider>
        {children}
        <ToastViewport />
        {toasts.map((t, i) => (
          <Toast
            key={i}
            variant={t.variant === "destructive" ? "destructive" : "default"}
          >
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && (
              <ToastDescription>{t.description}</ToastDescription>
            )}
          </Toast>
        ))}
      </ToastProvider>
    </ToastContext.Provider>
  );
};
