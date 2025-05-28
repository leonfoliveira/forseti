import { useEffect, useState } from "react";

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  useEffect(() => {
    const newTheme = (localStorage.getItem("theme") as Theme) || Theme.DARK;
    setTheme(newTheme);
  }, []);

  function toggleTheme() {
    const newTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }

  return {
    theme,
    toggleTheme,
  };
}
