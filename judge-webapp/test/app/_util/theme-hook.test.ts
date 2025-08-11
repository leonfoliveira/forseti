import { renderHook, act } from "@testing-library/react";

import { useTheme, Theme } from "@/app/_util/theme-hook";
import { storageService } from "@/config/composition";

describe("useTheme", () => {
  it("initializes with dark theme when no stored theme and prefers dark mode", () => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)",
    }));
    (storageService.getKey as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe(Theme.DARK);
    expect(storageService.setKey).toHaveBeenCalledWith("theme", Theme.DARK);
  });

  it("initializes with light theme when no stored theme and prefers light mode", () => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: light)",
    }));
    (storageService.getKey as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe(Theme.LIGHT);
    expect(storageService.setKey).toHaveBeenCalledWith("theme", Theme.LIGHT);
  });

  it("initializes with stored theme if available", () => {
    (storageService.getKey as jest.Mock).mockReturnValue(Theme.LIGHT);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe(Theme.LIGHT);
    expect(storageService.setKey).not.toHaveBeenCalled();
  });

  it("toggles theme from dark to light", () => {
    (storageService.getKey as jest.Mock).mockReturnValue(Theme.DARK);

    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe(Theme.LIGHT);
    expect(storageService.setKey).toHaveBeenCalledWith("theme", Theme.LIGHT);
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      Theme.LIGHT,
    );
  });

  it("toggles theme from light to dark", () => {
    (storageService.getKey as jest.Mock).mockReturnValue(Theme.LIGHT);

    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe(Theme.DARK);
    expect(storageService.setKey).toHaveBeenCalledWith("theme", Theme.DARK);
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      Theme.DARK,
    );
  });
});
