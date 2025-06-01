import { renderHook, act } from "@testing-library/react";
import { useTheme, Theme } from "@/app/_util/theme-hook";
import { storageService } from "@/app/_composition";

jest.mock("@/app/_composition", () => ({
  storageService: {
    getKey: jest.fn(),
    setKey: jest.fn(),
  },
}));

describe("useTheme", () => {
  const mockMatchMedia = jest.fn().mockReturnValue({
    matches: true,
  });

  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      value: mockMatchMedia,
    });
  });

  it("returns dark theme by default when no theme is stored and prefers dark", () => {
    (storageService.getKey as jest.Mock).mockReturnValueOnce(undefined);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe(Theme.DARK);
  });

  it("returns light theme by default when no theme is stored and do not prefers dark", () => {
    (storageService.getKey as jest.Mock).mockReturnValueOnce(undefined);
    mockMatchMedia.mockReturnValue({
      matches: false,
    });
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe(Theme.LIGHT);
  });

  it("returns stored theme if it exists", () => {
    (storageService.getKey as jest.Mock).mockReturnValueOnce(Theme.LIGHT);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe(Theme.LIGHT);
  });

  it("toggles theme from dark to light and updates storage and document attribute", () => {
    (storageService.getKey as jest.Mock).mockReturnValueOnce(Theme.DARK);
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe(Theme.LIGHT);
    expect(storageService.setKey).toHaveBeenCalledWith("theme", Theme.LIGHT);
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      Theme.LIGHT,
    );
  });

  it("toggles theme from light to dark and updates storage and document attribute", () => {
    (storageService.getKey as jest.Mock).mockReturnValueOnce(Theme.LIGHT);
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe(Theme.DARK);
    expect(storageService.setKey).toHaveBeenCalledWith("theme", Theme.DARK);
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      Theme.DARK,
    );
  });
});
