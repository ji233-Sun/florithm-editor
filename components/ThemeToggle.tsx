"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "florithm-theme";
const LIGHT = "florithm";
const DARK = "florithm-dark";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark =
      saved === DARK ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(prefersDark);
    document.documentElement.setAttribute(
      "data-theme",
      prefersDark ? DARK : LIGHT
    );
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const theme = next ? DARK : LIGHT;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  return (
    <button
      className="btn btn-ghost btn-sm btn-square"
      onClick={toggle}
      title={dark ? "切换到亮色模式" : "切换到暗色模式"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
