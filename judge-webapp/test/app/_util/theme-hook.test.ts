import { useTheme } from "@/app/_util/theme-hook";
import { renderHook, waitFor } from "@testing-library/react";
import { storageService } from "@/app/_composition";

jest.mock("@/app/_composition", () => ({
  storageService: {
    getKey: jest.fn(),
    setKey: jest.fn(),
  },
}));

window.matchMedia = jest.fn().mockReturnValue({
  matches: true,
});

describe("useTheme", () => {
  it("should initialize with the stored theme", () => {
    (storageService.getKey as jest.Mock).mockReturnValue("dark");
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
  });

  it("should initialize with user preference dark", () => {
    (storageService.getKey as jest.Mock).mockReturnValue(undefined);
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
  });

  it("should initialize with user preference light", () => {
    (storageService.getKey as jest.Mock).mockReturnValue(undefined);
    (window.matchMedia as jest.Mock).mockReturnValueOnce({ matches: false });

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("light");
  });

  it("should toggle theme from dark to light", async () => {
    (storageService.getKey as jest.Mock).mockReturnValue("dark");
    const { result } = renderHook(() => useTheme());

    result.current.toggleTheme();

    await waitFor(() => {
      expect(result.current.theme).toBe("light");
      expect(storageService.setKey).toHaveBeenCalledWith("theme", "light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });
  });
});
