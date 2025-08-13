import "@testing-library/jest-dom";
import { MemberType } from "@/core/domain/enumerate/MemberType";

// window
if (typeof window !== "undefined") {
  global.window ??= Object.create(window);
}

// react-intl
jest.mock("react-intl", () => ({
  defineMessages: (messages: any) => messages,
  FormattedMessage: ({ defaultMessage }: any) => defaultMessage,
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }) => id,
  }),
}));

jest.mock("@/lib/component/format/formatted-datetime", () => ({
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
jest.mock("@/store/slices/authorization-slice", () => ({
  ...jest.requireActual("@/store/slices/authorization-slice"),
  useAuthorization: mockUseAuthorization,
}));
export const mockSetAuthorization = jest.fn();
export const mockClearAuthorization = jest.fn();
export const mockUseSetAuthorization = jest.fn().mockReturnValue({
  setAuthorization: mockSetAuthorization,
  clearAuthorization: mockClearAuthorization,
});
jest.mock("@/app/_context/authorization-provider", () => ({
  useSetAuthorization: mockUseSetAuthorization,
}));

// Contest metadata
export const mockUseContestMetadata = jest.fn();
jest.mock("@/store/slices/contest-metadata-slice", () => ({
  ...jest.requireActual("@/store/slices/contest-metadata-slice"),
  useContestMetadata: mockUseContestMetadata,
}));

// Contestant dashboard
export const mockUseContestantDashboard = jest.fn();
jest.mock("@/store/slices/contestant-dashboard-slice", () => ({
  ...jest.requireActual("@/store/slices/contestant-dashboard-slice"),
  useContestantDashboard: mockUseContestantDashboard,
}));

// Guest dashboard
export const mockUseGuestDashboard = jest.fn();
jest.mock("@/store/slices/guest-dashboard-slice", () => ({
  ...jest.requireActual("@/store/slices/guest-dashboard-slice"),
  useGuestDashboard: mockUseGuestDashboard,
}));

// Judge dashboard
export const mockUseJudgeDashboard = jest.fn();
jest.mock("@/store/slices/judge-dashboard-slice", () => ({
  ...jest.requireActual("@/store/slices/judge-dashboard-slice"),
  useJudgeDashboard: mockUseJudgeDashboard,
}));
