import "@testing-library/jest-dom";

if (!!window) {
  global.window = Object.create(window);
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

jest.useFakeTimers();

declare global {
  interface HTMLElement {
    getByTestId(id: string): HTMLElement | null;
    getAllByTestId(id: string): HTMLElement[];
  }
}
HTMLElement.prototype.getByTestId = function (id: string) {
  return this.querySelector(`[data-testid="${id}"]`);
};
HTMLElement.prototype.getAllByTestId = function (id: string) {
  return Array.from(this.querySelectorAll(`[data-testid="${id}"]`));
};

jest.mock("@/config/composition");

(globalThis as any).__CLIENT_CONFIG__ = {
  apiPublicUrl: "http://localhost:8080",
};

const router = {
  push: jest.fn(),
};
export const useRouter = jest.fn(() => router);
export const usePathname = jest.fn(() => "/");
export const useSearchParams = jest.fn(() => ({
  get: jest.fn().mockReturnValue("bar"),
}));
export const redirect = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname,
  useRouter,
  useSearchParams,
  forbidden: jest.fn(),
  notFound: jest.fn(),
  redirect,
}));

const toast = {
  info: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
};
jest.mock("@/app/_lib/util/toast-hook", () => ({
  useToast: () => toast,
}));
