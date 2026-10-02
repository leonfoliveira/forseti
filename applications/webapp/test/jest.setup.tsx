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

process.env.TZ = "UTC";
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
  grafanaPublicUrl: "http://localhost:4000",
};

const router = {
  push: jest.fn(),
  replace: jest.fn(),
};
export const useRouter = jest.fn(() => router);
export const useParams = jest.fn(() => ({ slug: "test-slug" }));
export const usePathname = jest.fn(() => "/");
export const useSearchParams = jest.fn(() => ({
  get: jest.fn().mockReturnValue("bar"),
}));
export const redirect = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname,
  useRouter,
  useParams,
  useSearchParams,
  forbidden: jest.fn(),
  notFound: jest.fn(),
  redirect,
}));

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
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
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
  AlertDialog: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDialogCancel: (props: any) => <button {...props} />,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogMedia: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDialogTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
}));
jest.mock("@/app/_lib/component/shadcn/checkbox", () => ({
  Checkbox: (props: any) => <input type="checkbox" {...props} />,
}));
jest.mock("@/app/_lib/component/shadcn/field", () => ({
  Field: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  FieldContent: ({ children }: any) => <div>{children}</div>,
  FieldDescription: ({ children }: any) => <p>{children}</p>,
  FieldError: ({ children }: any) => <p role="alert">{children}</p>,
  FieldLabel: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));
jest.mock("@/app/_lib/component/shadcn/input", () => ({
  Input: (props: any) => <input {...props} />,
}));
jest.mock("@/app/_lib/component/shadcn/switch", () => ({
  Switch: (props: any) => <input type="checkbox" {...props} />,
}));
