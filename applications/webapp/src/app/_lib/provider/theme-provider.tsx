import { createContext, useContext, useEffect, useState } from "react";

import { storageReader, storageWritter } from "@/config/composition";

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: Theme.DARK,
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = "theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  /**
   * On component mount, retrieve the theme from storage or set it based on the user's preference.
   * Apply the theme class to the HTML element and store the theme in storage.
   */
  useEffect(() => {
    let theme = storageReader.getKey<Theme>(THEME_STORAGE_KEY);
    if (!theme) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      theme = prefersDark ? Theme.DARK : Theme.LIGHT;
    }

    const htmlElement = document.documentElement;
    htmlElement.classList.add(theme);
    storageWritter.setKey(THEME_STORAGE_KEY, theme);
    setTheme(theme);
  }, []);

  /**
   * Toggle the theme between light and dark modes.
   * Store the new theme in storage.
   */
  function toggleTheme() {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove(theme);

    const newTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    htmlElement.classList.add(newTheme);
    storageWritter.setKey(THEME_STORAGE_KEY, newTheme);
    setTheme(newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
