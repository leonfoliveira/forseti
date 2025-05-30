import { useEffect, useState } from "react";
import { storageService } from "@/app/_composition";

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

const THEME_STORAGE_KEY = "theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  useEffect(() => {
    const newTheme =
      storageService.getKey<Theme>(THEME_STORAGE_KEY) || Theme.DARK;
    setTheme(newTheme);
  }, []);

  function toggleTheme() {
    const newTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    setTheme(newTheme);
    storageService.setKey(THEME_STORAGE_KEY, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }

  return {
    theme,
    toggleTheme,
  };
}
