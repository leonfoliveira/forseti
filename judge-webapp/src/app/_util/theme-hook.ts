import { useEffect, useState } from "react";
import { storageService } from "@/app/_composition";
import { StorageService } from "@/core/service/StorageService";

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  useEffect(() => {
    let theme = storageService.getKey<Theme>(StorageService.THEME_STORAGE_KEY);
    if (!theme) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      theme = prefersDark ? Theme.DARK : Theme.LIGHT;
      storageService.setKey(StorageService.THEME_STORAGE_KEY, theme);
    }
    setTheme(theme);
  }, []);

  function toggleTheme() {
    const newTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    setTheme(newTheme);
    storageService.setKey(StorageService.THEME_STORAGE_KEY, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }

  return {
    theme,
    toggleTheme,
  };
}
