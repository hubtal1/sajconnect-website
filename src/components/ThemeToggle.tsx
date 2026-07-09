import { useEffect, useState } from "react";

type Theme = "dark" | "light";
const STORAGE_KEY = "saj_theme";

function readInitialTheme(): Theme {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
  }
  return "dark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readInitialTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage may be unavailable */
    }
  }

  // Avoid hydration mismatch flicker — render placeholder until mounted
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="flex h-[34px] w-[34px] items-center justify-center border border-[var(--color-hairline-dark)] bg-transparent"
      ></button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light" : "Switch to dark"}
      className="group flex h-[34px] w-[34px] items-center justify-center border border-[var(--color-hairline-dark)] bg-transparent transition-colors hover:border-[var(--color-cobalt-light)]"
    >
      {isDark ? (
        // Sun icon (will switch to light)
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="text-[var(--color-text-on-carbon-muted)] transition-colors group-hover:text-[var(--color-cobalt-light)]">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.6 3.4l-1 1M5.4 10.6l-1 1M12.6 12.6l-1-1M5.4 5.4l-1-1" />
        </svg>
      ) : (
        // Moon icon (will switch to dark)
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-on-carbon-muted)] transition-colors group-hover:text-[var(--color-cobalt-light)]">
          <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" />
        </svg>
      )}
    </button>
  );
}
