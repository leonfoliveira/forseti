import React from "react";
import { fireEvent, screen } from "@testing-library/react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import {
  MockSessionResponseDTO,
  MockSubmissionResponseDTO,
  MockSubmissionWithCodeResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/hook/useContestStatusWatcher", () => ({
  useContestStatusWatcher: () => ContestStatus.IN_PROGRESS,
}));
jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageForm",
  () => ({
    SubmissionsPageForm: () => <div data-testid="create-form">Create form</div>,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionsMenu",
  () => ({
    SubmissionsPageActionsMenu: () => <span>Actions</span>,
  }),
);
jest.mock("@/app/_lib/component/shadcn/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
jest.mock("@/app/_lib/component/shadcn/alert", () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
}));
jest.mock("@/app/_lib/component/shadcn/separator", () => ({
  Separator: () => <hr />,
}));
jest.mock("@/app/_lib/component/shadcn/toggle", () => ({
  Toggle: ({
    children,
    pressed,
    onPressedChange,
    ...props
  }: {
    children: React.ReactNode;
    pressed: boolean;
    onPressedChange: (next: boolean) => void;
  }) => (
    <button
      {...props}
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
    >
      {children}
    </button>
  ),
}));
jest.mock("@/app/_lib/component/shadcn/table", () => ({
  Table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <table {...props}>{children}</table>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  TableCell: ({
    children,
    ...props
  }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td {...props}>{children}</td>
  ),
  TableHead: ({ children }: { children: React.ReactNode }) => (
    <th>{children}</th>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead>{children}</thead>
  ),
  TableRow: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr {...props}>{children}</tr>
  ),
}));

describe("SubmissionsPage", () => {
  it("renders submissions, the only-mine filter, and the in-progress creation action", async () => {
    const own = MockSubmissionResponseDTO({
      id: "own",
      member: { ...MockSubmissionResponseDTO().member, id: "me", name: "Me" },
    });
    await renderWithProviders(
      <SubmissionsPage
        submissions={[
          MockSubmissionWithCodeResponseDTO({ id: "with-code" }),
          own,
        ]}
        memberSubmissions={[own as never]}
        problems={[]}
        canCreate
        onCreate={jest.fn()}
      />,
      { session: MockSessionResponseDTO() },
    );
    expect(screen.getByTestId("submissions-table")).toBeInTheDocument();
    expect(screen.getByTestId("open-create-form-button")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("only-mine-toggle"));
    expect(screen.getByTestId("only-mine-toggle")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
