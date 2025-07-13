import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: (key: string) => key,
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
