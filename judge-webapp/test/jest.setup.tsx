import "@testing-library/jest-dom";
import { MemberType } from "@/core/domain/enumerate/MemberType";

// react-intl
jest.mock("react-intl", () => ({
  defineMessages: (messages: any) => messages,
  FormattedMessage: ({ defaultMessage }: any) => defaultMessage,
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }) => id,
  }),
}));

jest.mock("@/app/_component/format/formatted-datetime", () => ({
  FormattedDateTime: ({ timestamp }: any) => timestamp,
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

// Redux
export const mockUseAppSelector = jest.fn();
export const mockAppDispatch = jest.fn();
jest.mock("@/store/store", () => ({
  useAppSelector: mockUseAppSelector,
  useAppDispatch: () => mockAppDispatch,
}));

// Composition
jest.mock("@/config/composition");

// Notification
export const mockAlert = {
  success: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
};
jest.mock("@/store/slices/alerts-slice", () => ({
  ...jest.requireActual("@/store/slices/alerts-slice"),
  useAlert: () => mockAlert,
}));
export const mockToast = {
  success: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
};
jest.mock("@/store/slices/toasts-slice", () => ({
  ...jest.requireActual("@/store/slices/toasts-slice"),
  useToast: () => mockToast,
}));

// Authorization
export const mockUseAuthorization = jest.fn().mockReturnValue({
  member: {
    name: "Test User",
    type: MemberType.CONTESTANT,
  },
});
export const mockSetAuthorization = jest.fn();
export const mockClearAuthorization = jest.fn();
export const mockUseAuthorizationContext = jest.fn().mockReturnValue({
  authorization: undefined,
  setAuthorization: mockSetAuthorization,
  clearAuthorization: mockClearAuthorization,
});
jest.mock("@/app/_context/authorization-context", () => ({
  useAuthorization: mockUseAuthorization,
  useAuthorizationContext: mockUseAuthorizationContext,
}));
