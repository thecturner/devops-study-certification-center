"use client";

import { useSyncExternalStore } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem("theme", theme);
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("themechange", onStoreChange);
  return () => window.removeEventListener("themechange", onStoreChange);
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "light"
  );

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <div className="fixed right-4 top-4 z-50">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="brand-shell h-10 rounded-full px-4"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <SunMedium /> : <MoonStar />}
        <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
      </Button>
    </div>
  );
}
