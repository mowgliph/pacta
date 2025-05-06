import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useThemeStore } from "../../store/theme";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "./toast";

type Theme = "light" | "dark" | "system";

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
}

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme as Theme);
  const setTheme = useThemeStore(
    (state) => state.setTheme as (theme: Theme) => void
  );
  const initialized = useRef(false);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !initialized.current &&
      theme === "system" &&
      // @ts-ignore
      window.Electron?.theme?.getSystemTheme
    ) {
      // @ts-ignore
      window.Electron.theme
        .getSystemTheme()
        .then((systemTheme: "light" | "dark") => {
          setTheme(systemTheme);
        });
      initialized.current = true;
    }
    // eslint-disable-next-line
  }, [theme]);

  const handleSetTheme = async (value: Theme) => {
    setSaving(true);
    setTheme(value);
    try {
      // @ts-ignore
      const res = await window.Electron?.theme?.setAppTheme?.(value);
      if (res?.success) {
        setToastMsg(
          `Tema "${
            value === "light"
              ? "Claro"
              : value === "dark"
              ? "Oscuro"
              : "Sistema"
          }" guardado en preferencias.`
        );
      } else {
        setToastError("No se pudo guardar la preferencia de tema.");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("api-error"));
        }
      }
    } catch {
      setToastError("No se pudo guardar la preferencia de tema.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api-error"));
      }
    } finally {
      setSaving(false);
    }
  };

  const themes: ThemeOption[] = [
    {
      value: "light",
      label: "Claro",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M6.34 17.66l-1.41 1.41" />
          <path d="M19.07 4.93l-1.41 1.41" />
        </svg>
      ),
    },
    {
      value: "dark",
      label: "Oscuro",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
        </svg>
      ),
    },
    {
      value: "system",
      label: "Sistema",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <ToastProvider>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="transition duration-200 focus-visible:ring-2"
            >
              {theme === "light" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="M4.93 4.93l1.41 1.41" />
                  <path d="M17.66 17.66l1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="M6.34 17.66l-1.41 1.41" />
                  <path d="M19.07 4.93l-1.41 1.41" />
                </svg>
              )}
              {theme === "dark" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
                </svg>
              )}
              {theme === "system" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="14" x="2" y="3" rx="2" />
                  <line x1="8" x2="16" y1="21" y2="21" />
                  <line x1="12" x2="12" y1="17" y2="21" />
                </svg>
              )}
              <span className="sr-only">Cambiar tema</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="end">
            <div className="grid grid-cols-1 gap-2">
              {themes.map((option) => (
                <Button
                  key={option.value}
                  variant={theme === option.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleSetTheme(option.value)}
                  className="justify-start font-normal"
                  disabled={saving}
                >
                  <div className="flex items-center">
                    {option.icon}
                    {option.label}
                  </div>
                  {theme === option.value && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-auto"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <ToastViewport />
        {toastMsg && (
          <Toast open onOpenChange={() => setToastMsg(null)}>
            <ToastTitle>Preferencia guardada</ToastTitle>
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
      </ToastProvider>
    </>
  );
}
