import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { randomUUID } from "crypto";

// Native Node.js modules polyfills
global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

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

process.env.TZ = "UTC";
jest.useFakeTimers();

export const eventSource = {
  onopen: jest.fn(),
  onmessage: jest.fn(),
  onerror: jest.fn(),
  addEventListener: jest.fn(),
};
global.EventSource = jest.fn(() => eventSource) as never;

// Custom extensions for HTMLElement to support queries by test ID
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

// Mocking UUID generation as uuid module does not work well with jest
jest.mock("uuid", () => ({
  v4: jest.fn().mockImplementation(() => randomUUID()),
}));

// Mocking system composition
jest.mock("@/config/composition");

// Mocking react-router-dom hooks
export const location = { pathname: "/" };
export const navigate = jest.fn();
export const getSearchParams = { get: jest.fn().mockReturnValue("contest-1") };
export const revalidate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(() => location),
  useNavigate: jest.fn(() => navigate),
  useSearchParams: jest.fn(() => [getSearchParams] as never),
  useRevalidator: jest.fn(() => ({ revalidate })),
}));

// Mocking shadcn UI components
jest.mock("@/app/_lib/component/shadcn/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => children,
  DropdownMenuTrigger: ({ children }: any) => children,
  DropdownMenuContent: ({ children }: any) => children,
  DropdownMenuGroup: ({ children }: any) => children,
  DropdownMenuLabel: ({ children }: any) => children,
  DropdownMenuItem: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));
jest.mock("@/app/_lib/component/shadcn/badge", () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));
jest.mock("@/app/_lib/component/shadcn/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/app/_lib/component/shadcn/spinner", () => ({
  Spinner: (props: any) => <span {...props} />,
}));
jest.mock("@/app/_lib/component/shadcn/tooltip", () => ({
  TooltipProvider: ({ children }: any) => children,
  Tooltip: ({ children }: any) => children,
  TooltipTrigger: ({ children }: any) => children,
  TooltipContent: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("@/app/_lib/component/shadcn/alert-dialog", () => ({
  AlertDialog: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  AlertDialogCancel: (props: any) => <button {...props} />,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children, ...props }: any) => (
    <p {...props}>{children}</p>
  ),
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogMedia: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  AlertDialogTitle: ({ children, ...props }: any) => (
    <h2 {...props}>{children}</h2>
  ),
}));
jest.mock("@/app/_lib/component/shadcn/checkbox", () => ({
  Checkbox: (props: any) => <input type="checkbox" {...props} />,
}));
jest.mock("@/app/_lib/component/shadcn/field", () => ({
  Field: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  FieldContent: ({ children }: any) => <div>{children}</div>,
  FieldDescription: ({ children }: any) => <p>{children}</p>,
  FieldError: ({ children }: any) => <p role="alert">{children}</p>,
  FieldLabel: ({ children, ...props }: any) => (
    <label {...props}>{children}</label>
  ),
  FieldSet: ({ children, ...props }: any) => (
    <fieldset {...props}>{children}</fieldset>
  ),
}));
jest.mock("@/app/_lib/component/shadcn/input", () => ({
  Input: (props: any) => <input {...props} />,
}));
jest.mock("@/app/_lib/component/shadcn/switch", () => ({
  Switch: (props: any) => <input type="checkbox" {...props} />,
}));

// Mocking useToast hook
const toast = {
  info: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
};
jest.mock("@/app/_lib/hook/useToast", () => ({
  useToast: () => toast,
}));
