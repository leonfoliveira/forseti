import React from "react";
import { render, screen } from "@testing-library/react";

import { SubmissionsPageForm } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageForm";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { MockContestResponseDTO, MockProblemResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/form/ControlledField", () => ({
  ControlledField: ({ name }: { name: string }) => <div data-testid={`field-${name}`} />,
}));
jest.mock("@/app/_lib/component/shadcn/card", () => ({
  Card: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));
jest.mock("@/app/_lib/component/shadcn/field", () => ({
  FieldSet: ({ children }: { children: React.ReactNode }) => <fieldset>{children}</fieldset>,
}));
jest.mock("@/app/_lib/component/shadcn/separator", () => ({ Separator: () => <hr /> }));

describe("SubmissionsPageForm", () => {
  it("renders the problem, language, and code inputs", async () => {
    await renderWithProviders(
      <SubmissionsPageForm onClose={jest.fn()} problems={[MockProblemResponseDTO()]} onCreate={jest.fn()} />,
      { contest: MockContestResponseDTO({ languages: [SubmissionLanguage.CPP_17] }) },
    );
    expect(screen.getByTestId("submission-form")).toBeInTheDocument();
    expect(screen.getByTestId("field-problemId")).toBeInTheDocument();
    expect(screen.getByTestId("field-language")).toBeInTheDocument();
    expect(screen.getByTestId("field-code")).toBeInTheDocument();
  });
});
