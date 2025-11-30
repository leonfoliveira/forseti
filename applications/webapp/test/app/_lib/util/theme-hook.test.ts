import { act } from "@testing-library/react";

import { renderHookWithProviders } from "@/test/render-with-providers";

// Mock the storage service first
const mockStorageReader = {
  getKey: jest.fn(),
};
const mockStorageWritter = {
  setKey: jest.fn(),
};

jest.mock("@/config/composition", () => ({
  storageReader: mockStorageReader,
  storageWritter: mockStorageWritter,
}));

// Import after mocking to avoid initialization issues
const { Theme, useTheme } = require("@/app/_lib/util/theme-hook");

// Mock document.documentElement
const mockDocumentElement = {
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
  },
};

Object.defineProperty(document, "documentElement", {
  value: mockDocumentElement,
  writable: true,
});

describe("useTheme", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDocumentElement.classList.add.mockClear();
    mockDocumentElement.classList.remove.mockClear();
  });

  it("should initialize with stored theme", async () => {
    mockStorageReader.getKey.mockReturnValue(Theme.LIGHT);

    const { result } = await renderHookWithProviders(() => useTheme());

    expect(result.current.theme).toBe(Theme.LIGHT);
    expect(mockStorageReader.getKey).toHaveBeenCalledWith("theme");
  });

  it("should toggle from dark to light", async () => {
    mockStorageReader.getKey.mockReturnValue(Theme.DARK);

    const { result } = await renderHookWithProviders(() => useTheme());

    expect(result.current.theme).toBe(Theme.DARK);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe(Theme.LIGHT);
    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith(
      Theme.DARK,
    );
    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith(Theme.LIGHT);
    expect(mockStorageWritter.setKey).toHaveBeenCalledWith(
      "theme",
      Theme.LIGHT,
    );
  });

  it("should toggle from light to dark", async () => {
    mockStorageReader.getKey.mockReturnValue(Theme.LIGHT);

    const { result } = await renderHookWithProviders(() => useTheme());

    expect(result.current.theme).toBe(Theme.LIGHT);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe(Theme.DARK);
    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith(
      Theme.LIGHT,
    );
    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith(Theme.DARK);
    expect(mockStorageWritter.setKey).toHaveBeenCalledWith("theme", Theme.DARK);
  });

  it("should toggle multiple times correctly", async () => {
    mockStorageReader.getKey.mockReturnValue(Theme.DARK);

    const { result } = await renderHookWithProviders(() => useTheme());

    // First toggle: dark -> light
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe(Theme.LIGHT);

    // Second toggle: light -> dark
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe(Theme.DARK);

    // Third toggle: dark -> light
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe(Theme.LIGHT);
  });
});
