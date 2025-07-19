import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

export const mockRouter = {
  push: jest.fn(),
};
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  redirect: jest.fn(),
  RedirectType: jest.requireActual("next/navigation").RedirectType,
}));

export const mockAlert = {
  warning: jest.fn(),
  error: jest.fn(),
};
jest.mock("@/app/_component/context/notification-context", () => ({
  useAlert: () => mockAlert,
}));
