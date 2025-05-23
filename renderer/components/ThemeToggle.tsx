import React, { useRef, useState } from "react";
import { useThemeStore } from "../store/theme";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./ui/toast";

type Theme = "light" | "dark" | "system";

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
}

const themeOptions: ThemeOption[] = [
  {
    value: "light",
    label: "Claro",
    icon: (
      <svg
        className="w-5 h-5 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Oscuro",
    icon: (
      <svg
        className="w-5 h-5 text-gray-700 dark:text-gray-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    ),
  },
  {
    value: "system",
    label: "Sistema",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export const ThemeToggle: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const initialized = useRef(false);

  const handleSetTheme = async (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      await window.Electron?.ipcRenderer.invoke("theme:set-app", newTheme);
      setToastMsg(
        `Tema "${
          newTheme === "light"
            ? "Claro"
            : newTheme === "dark"
            ? "Oscuro"
            : "Sistema"
        }" aplicado correctamente.`
      );
    } catch (error) {
      setToastError("No se pudo cambiar el tema.");
      console.error("Error al cambiar el tema:", error);
    }
  };

  return (
    <>
      <ToastProvider>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Seleccionar tema"
            >
              {themeOptions.find((opt) => opt.value === theme)?.icon}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1" align="end">
            <div className="grid gap-1">
              {themeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={theme === option.value ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 px-2 py-1.5"
                  onClick={() => handleSetTheme(option.value)}
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {toastMsg && (
          <Toast open onOpenChange={() => setToastMsg(null)}>
            <ToastTitle>Tema actualizado</ToastTitle>
            <ToastDescription>{toastMsg}</ToastDescription>
          </Toast>
        )}

        {toastError && (
          <Toast
            open
            variant="destructive"
            onOpenChange={() => setToastError(null)}
          >
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>{toastError}</ToastDescription>
          </Toast>
        )}
        <ToastViewport />
      </ToastProvider>
    </>
  );
};
