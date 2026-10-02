import { render, screen } from "@testing-library/react";

import SignInPage from "@/app/[slug]/sign-in/page";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/shadcn/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
  CardFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h1 {...props}>{children}</h1>,
}));
jest.mock("@/app/_lib/component/shadcn/field", () => ({
  FieldSet: ({ children, ...props }: React.FieldsetHTMLAttributes<HTMLFieldSetElement>) => <fieldset {...props}>{children}</fieldset>,
  Field: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  FieldContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FieldDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  FieldError: ({ children }: { children: React.ReactNode }) => <p role="alert">{children}</p>,
  FieldLabel: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...props}>{children}</label>,
}));
jest.mock("@/app/_lib/component/shadcn/separator", () => ({ Separator: () => <hr /> }));

describe("SignInPage", () => {
  it("renders login and guest entry controls", async () => {
    await renderWithProviders(<SignInPage />, { contest: MockContestResponseDTO(), session: null });
    expect(screen.getByTestId("title")).toHaveTextContent("Sign In");
    expect(screen.getByTestId("login")).toBeInTheDocument();
    expect(screen.getByTestId("password")).toHaveAttribute("type", "password");
    expect(screen.getByTestId("sign-in")).toBeInTheDocument();
    expect(screen.getByTestId("enter-guest")).toBeInTheDocument();
  });
});
