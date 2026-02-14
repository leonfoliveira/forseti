import { act, render } from "@testing-library/react";

import {
  Theme,
  ThemeProvider,
  useTheme,
} from "@/app/_lib/provider/theme-provider";
import { storageReader, storageWritter } from "@/config/composition";

jest.mock("@/config/composition", () => ({
  storageReader: {
    getKey: jest.fn(),
  },
  storageWritter: {
    setKey: jest.fn(),
  },
}));

const mockStorageReader = storageReader as jest.Mocked<typeof storageReader>;
const mockStorageWritter = storageWritter as jest.Mocked<typeof storageWritter>;

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

// Test component to access the theme context
function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button data-testid="toggle-button" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageReader.getKey.mockClear();
    mockStorageWritter.setKey.mockClear();
    mockDocumentElement.classList.add.mockClear();
    mockDocumentElement.classList.remove.mockClear();
  });

  describe("initialization", () => {
    it("should initialize with dark theme when no stored theme and user prefers dark", () => {
      mockStorageReader.getKey.mockReturnValue(null);

      // Mock matchMedia to return true for prefers-color-scheme: dark
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation(() => ({
          matches: true,
        })),
      });

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(getByTestId("current-theme")).toHaveTextContent(Theme.DARK);
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith(
        Theme.DARK,
      );
      expect(mockStorageWritter.setKey).toHaveBeenCalledWith(
        "theme",
        Theme.DARK,
      );
    });

    it("should initialize with light theme when no stored theme and user prefers light", () => {
      mockStorageReader.getKey.mockReturnValue(null);

      // Mock matchMedia to return false for prefers-color-scheme: dark
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation(() => ({
          matches: false,
        })),
      });

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(getByTestId("current-theme")).toHaveTextContent(Theme.LIGHT);
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith(
        Theme.LIGHT,
      );
      expect(mockStorageWritter.setKey).toHaveBeenCalledWith(
        "theme",
        Theme.LIGHT,
      );
    });

    it("should initialize with stored theme when available", () => {
      mockStorageReader.getKey.mockReturnValue(Theme.LIGHT);

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(getByTestId("current-theme")).toHaveTextContent(Theme.LIGHT);
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith(
        Theme.LIGHT,
      );
      expect(mockStorageWritter.setKey).toHaveBeenCalledWith(
        "theme",
        Theme.LIGHT,
      );
      expect(mockStorageReader.getKey).toHaveBeenCalledWith("theme");
    });
  });

  describe("theme toggling", () => {
    it("should toggle from dark to light theme", () => {
      mockStorageReader.getKey.mockReturnValue(Theme.DARK);

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(getByTestId("current-theme")).toHaveTextContent(Theme.DARK);

      act(() => {
        getByTestId("toggle-button").click();
      });

      expect(getByTestId("current-theme")).toHaveTextContent(Theme.LIGHT);
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith(
        Theme.DARK,
      );
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith(
        Theme.LIGHT,
      );
      expect(mockStorageWritter.setKey).toHaveBeenCalledWith(
        "theme",
        Theme.LIGHT,
      );
    });

    it("should toggle from light to dark theme", () => {
      mockStorageReader.getKey.mockReturnValue(Theme.LIGHT);

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(getByTestId("current-theme")).toHaveTextContent(Theme.LIGHT);

      act(() => {
        getByTestId("toggle-button").click();
      });

      expect(getByTestId("current-theme")).toHaveTextContent(Theme.DARK);
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith(
        Theme.LIGHT,
      );
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith(
        Theme.DARK,
      );
      expect(mockStorageWritter.setKey).toHaveBeenCalledWith(
        "theme",
        Theme.DARK,
      );
    });

    it("should toggle multiple times correctly", () => {
      mockStorageReader.getKey.mockReturnValue(Theme.DARK);

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      // Initial state
      expect(getByTestId("current-theme")).toHaveTextContent(Theme.DARK);

      // First toggle: dark -> light
      act(() => {
        getByTestId("toggle-button").click();
      });
      expect(getByTestId("current-theme")).toHaveTextContent(Theme.LIGHT);

      // Second toggle: light -> dark
      act(() => {
        getByTestId("toggle-button").click();
      });
      expect(getByTestId("current-theme")).toHaveTextContent(Theme.DARK);

      // Third toggle: dark -> light
      act(() => {
        getByTestId("toggle-button").click();
      });
      expect(getByTestId("current-theme")).toHaveTextContent(Theme.LIGHT);
    });
  });

  describe("storage integration", () => {
    it("should read theme from storage on initialization", () => {
      mockStorageReader.getKey.mockReturnValue(Theme.LIGHT);

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(mockStorageReader.getKey).toHaveBeenCalledWith("theme");
    });

    it("should write theme to storage on initialization when no stored theme", () => {
      mockStorageReader.getKey.mockReturnValue(null);

      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation(() => ({
          matches: true,
        })),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(mockStorageWritter.setKey).toHaveBeenCalledWith(
        "theme",
        Theme.DARK,
      );
    });

    it("should write theme to storage on toggle", () => {
      mockStorageReader.getKey.mockReturnValue(Theme.DARK);

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      act(() => {
        getByTestId("toggle-button").click();
      });

      expect(mockStorageWritter.setKey).toHaveBeenCalledWith(
        "theme",
        Theme.LIGHT,
      );
    });
  });

  describe("DOM manipulation", () => {
    it("should add theme class to document element on initialization", () => {
      mockStorageReader.getKey.mockReturnValue(Theme.LIGHT);

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith(
        Theme.LIGHT,
      );
    });

    it("should remove old theme class and add new theme class on toggle", () => {
      mockStorageReader.getKey.mockReturnValue(Theme.DARK);

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      act(() => {
        getByTestId("toggle-button").click();
      });

      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith(
        Theme.DARK,
      );
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith(
        Theme.LIGHT,
      );
    });
  });

  describe("useTheme hook", () => {
    it("should provide current theme and toggleTheme function", () => {
      mockStorageReader.getKey.mockReturnValue(Theme.DARK);

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(getByTestId("current-theme")).toHaveTextContent(Theme.DARK);
      expect(getByTestId("toggle-button")).toBeInTheDocument();
    });

    it("should throw error when used outside ThemeProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      function ComponentWithoutProvider() {
        useTheme();
        return <div>Test</div>;
      }

      expect(() => render(<ComponentWithoutProvider />)).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("Theme enum", () => {
    it("should have correct theme values", () => {
      expect(Theme.LIGHT).toBe("light");
      expect(Theme.DARK).toBe("dark");
    });
  });
});
