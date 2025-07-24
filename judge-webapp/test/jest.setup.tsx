import "@testing-library/jest-dom";

// next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// next/navigation
export const mockRouter = {
  push: jest.fn(),
};
export const mockSearchParams = {
  get: jest.fn(),
};
export const mockUsePathname = jest.fn().mockReturnValue("/");
export const mockRedirect = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
  usePathname: mockUsePathname,
  redirect: mockRedirect,
  RedirectType: jest.requireActual("next/navigation").RedirectType,
}));

// Composition
jest.mock("@/config/composition");

// Notification
export const mockAlert = {
  success: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
};
jest.mock("@/app/_context/notification-context", () => ({
  useAlert: () => mockAlert,
  NotificationLevel: jest.requireActual("@/app/_context/notification-context")
    .NotificationLevel,
}));

// Authorization
export const mockSetAuthorization = jest.fn();
export const mockClearAuthorization = jest.fn();
export const mockUseAuthorization = jest.fn().mockReturnValue({
  authorization: undefined,
  setAuthorization: mockSetAuthorization,
  clearAuthorization: mockClearAuthorization,
});
jest.mock("@/app/_context/authorization-context", () => ({
  useAuthorization: mockUseAuthorization,
}));
