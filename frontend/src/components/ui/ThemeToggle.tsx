import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "../theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <IconSun
        className={`theme-toggle-icon h-5 w-5 ${
          theme === "light" ? "text-primary" : "text-muted-foreground opacity-50 rotate-90 scale-0"
        }`}
      />
      <IconMoon
        className={`theme-toggle-icon absolute h-5 w-5 ${
          theme === "dark" ? "text-primary" : "text-muted-foreground opacity-0 -rotate-90 scale-0"
        }`}
      />
    </button>
  );
}