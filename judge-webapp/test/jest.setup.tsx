import "@testing-library/jest-dom";
import { NotificationLevel } from "@/app/_component/context/notification-context";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

export const mockRouter = {
  push: jest.fn(),
};
export const mockSearchParams = {
  get: jest.fn(),
};
export const mockRedirect = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
  redirect: mockRedirect,
  RedirectType: jest.requireActual("next/navigation").RedirectType,
}));

jest.mock("@/config/composition");

export const mockAlert = {
  warning: jest.fn(),
  error: jest.fn(),
};
jest.mock("@/app/_component/context/notification-context", () => ({
  useAlert: () => mockAlert,
  NotificationLevel: jest.requireActual(
    "@/app/_component/context/notification-context",
  ).NotificationLevel,
}));

export const mockAuthorization = {
  authorization: undefined,
  setAuthorization: jest.fn(),
  clearAuthorization: jest.fn(),
};
jest.mock("@/app/_component/context/authorization-context", () => ({
  useAuthorization: () => mockAuthorization,
}));
