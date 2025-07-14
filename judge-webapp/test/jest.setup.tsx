import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

export const redirect = jest.fn();
export const router = {
  push: jest.fn(),
};
jest.mock("next/navigation", () => ({
  redirect,
  useRouter: () => router,
  RedirectType: {
    push: "push",
    replace: "replace",
  },
}));

export const alert = {
  info: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
};
jest.mock("@/app/_component/context/notification-context", () => ({
  useAlert: () => alert,
}));
