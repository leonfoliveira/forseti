import "@testing-library/jest-dom";

// Mocking the next-intl module for translations

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: jest.fn().mockReturnValue({
    dateTime: jest.fn().mockImplementation((date: Date) => {
      return !isNaN(date.getTime()) ? date.toISOString() : undefined;
    }),
  }),
}));

// Mocking navigation and routing functionalities

export const redirect = jest.fn();
export const router = {
  push: jest.fn(),
};
jest.mock("next/navigation", () => ({
  redirect,
  usePathname: jest.fn().mockReturnValue("/"),
  useRouter: jest.fn().mockReturnValue(router),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn(),
  }),
  RedirectType: {
    push: "push",
    replace: "replace",
  },
}));

// Mocking the notification context

export const alert = {
  info: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
};
jest.mock("@/app/_component/context/notification-context", () => ({
  useAlert: () => alert,
  NotificationLevel: jest.requireActual(
    "@/app/_component/context/notification-context",
  ).NotificationLevel,
  NotificationType: jest.requireActual(
    "@/app/_component/context/notification-context",
  ).NotificationType,
}));
