import React, { useRef, useState, useEffect } from "react";
import { useThemeStore } from "../../store/theme";
import { cn } from "../../lib/utils";
import { Check, ChevronDown, Moon, Sun, Monitor } from "lucide-react";
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastProps,
} from "./toast";

// Extender las props del Toast para incluir className
type ExtendedToastProps = ToastProps & {
  className?: string;
};

type Theme = "light" | "dark" | "system";

import { LucideIcon } from "lucide-react";

interface ThemeOption {
  value: Theme;
  label: string;
  icon: LucideIcon;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    value: "light",
    label: "Claro",
    icon: Sun,
    description: "Tema claro con colores brillantes"
  },
  {
    value: "dark",
    label: "Oscuro",
    icon: Moon,
    description: "Tema oscuro para una experiencia cómoda"
  },
  {
    value: "system",
    label: "Sistema",
    icon: Monitor,
    description: "Sincronizado con la configuración de tu sistema"
  },
];

export const ThemeToggle: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const initialized = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cerrar el popover cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSetTheme = async (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      await window.electron.ipcRenderer.invoke("theme:set-app", newTheme);
      setToastMsg(
        `Tema "${
          newTheme === "light"
            ? "Claro"
            : newTheme === "dark"
            ? "Oscuro"
            : "Sistema"
        }" aplicado correctamente.`
      );
      setIsOpen(false); // Cerrar el menú después de seleccionar un tema
    } catch (error) {
      setToastError("No se pudo cambiar el tema.");
      console.error("Error al cambiar el tema:", error);
    }
  };

  const currentTheme = themeOptions.find(t => t.value === theme) || themeOptions[0];

  const renderIcon = (IconComponent: React.ComponentType<{ className?: string }>, className: string) => {
    return <IconComponent className={cn("h-4 w-4", className)} />;
  };

  return (
    <ToastProvider>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700",
            "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700",
            "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50",
            "shadow-sm"
          )}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label="Seleccionar tema"
        >
          <div className="flex items-center justify-center w-5 h-5">
            {renderIcon(currentTheme.icon, 
              theme === 'light' ? 'text-amber-500' : 
              theme === 'dark' ? 'text-indigo-400' : 'text-gray-600 dark:text-gray-300'
            )}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {currentTheme.label}
          </span>
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-gray-500 transition-transform duration-200",
              isOpen ? "rotate-180" : ""
            )} 
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div 
            className={cn(
              "absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-gray-800",
              "shadow-lg ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-50",
              "animate-in fade-in-80 slide-in-from-top-2"
            )}
          >
            <div className="p-1">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSetTheme(option.value)}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                      "transition-colors duration-150",
                      theme === option.value
                        ? "bg-primary/5 text-primary dark:bg-primary/10"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50"
                    )}
                    aria-selected={theme === option.value}
                    role="option"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                      {renderIcon(option.icon, 
                        option.value === 'light' ? 'text-amber-500' : 
                        option.value === 'dark' ? 'text-indigo-400' : 'text-gray-600 dark:text-gray-300'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                    {theme === option.value && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {toastMsg && (
        <Toast open={!!toastMsg} onOpenChange={() => setToastMsg(null)}>
          <div className="grid gap-1">
            <ToastTitle>Tema actualizado</ToastTitle>
            <ToastDescription>{toastMsg}</ToastDescription>
          </div>
        </Toast>
      )}

      {toastError && (
        <Toast 
          open={!!toastError}
          onOpenChange={() => setToastError(null)}
        >
          <div className="grid gap-1">
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>{toastError}</ToastDescription>
          </div>
        </Toast>
      )}
      
      <ToastViewport />
    </ToastProvider>
  );
};
