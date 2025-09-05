import { useEffect, useState } from "react";

import { storageService } from "@/config/composition";
import { StorageService } from "@/core/service/StorageService";

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

/**
 * Utility hook to manage the theme of the application.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  useEffect(() => {
    /**
     * Retrieve the theme from storage or set it based on the user's preference.
     */
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

  /**
   * Toggle the theme between light and dark modes.
   * Store the new theme
   */
  function toggleTheme() {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove(theme);

    const newTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    setTheme(newTheme);
    storageService.setKey(StorageService.THEME_STORAGE_KEY, newTheme);
    htmlElement.classList.add(newTheme);
  }

  return {
    theme,
    toggleTheme,
  };
}
