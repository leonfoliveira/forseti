import { act, fireEvent, render, screen } from "@testing-library/react";

import { Theme, ThemeProvider, useTheme } from "@/app/_lib/provider/ThemeProvider";
import { Composition } from "@/config/composition";

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  return <button data-testid="theme-button" onClick={toggleTheme}>{theme}</button>;
}

describe("ThemeProvider", () => {
  it("loads the saved theme and persists changes", async () => {
    (Composition.localStorageReader.getKey as jest.Mock).mockReturnValue(Theme.LIGHT);
    render(<ThemeProvider><ThemeButton /></ThemeProvider>);
    await act(async () => Promise.resolve());
    expect(screen.getByTestId("theme-button")).toHaveTextContent(Theme.LIGHT);
    expect(document.documentElement).toHaveClass(Theme.LIGHT);
    fireEvent.click(screen.getByTestId("theme-button"));
    expect(screen.getByTestId("theme-button")).toHaveTextContent(Theme.DARK);
    expect(Composition.localStorageWritter.setKey).toHaveBeenLastCalledWith("theme", Theme.DARK);
  });
});
