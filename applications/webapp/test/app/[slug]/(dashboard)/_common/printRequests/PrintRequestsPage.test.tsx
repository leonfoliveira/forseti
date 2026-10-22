import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render-with-providers";
import { PrintRequestsPage } from "@/app/[slug]/(dashboard)/_common/printRequests/PrintRequestsPage";
import { MockPrintRequestResponseDTO } from "@/test/mock/response/MockDTOs";
import { EnumeratedTextUtil } from "@/app/_lib/util/EnumeratedTextUtil";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/printRequests/PrintRequestsPageActions",
  () => ({
    PrintRequestsPageActions: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: any;
    }) => <div {...props}>{children}</div>,
  }),
);

describe("PrintRequestsPage", () => {
  it("should render correctly with canUpdate = false", async () => {
    const printRequests = [MockPrintRequestResponseDTO()];

    await renderWithProviders(
      <PrintRequestsPage printRequests={printRequests} canUpdate={false} />,
    );

    expect(screen.getByTestId("print-requests-table")).toBeInTheDocument();

    const rows = screen.getAllByTestId("print-request-row");
    expect(rows).toHaveLength(printRequests.length);
    expect(
      rows[0].getByTestId("print-request-timestamp"),
    ).not.toBeEmptyDOMElement();
    expect(rows[0].getByTestId("print-request-contestant")).toHaveTextContent(
      printRequests[0].submission.member.name,
    );
    expect(rows[0].getByTestId("print-request-problem")).toHaveTextContent(
      printRequests[0].submission.problem.letter,
    );
    expect(rows[0].getByTestId("print-request-status")).toHaveTextContent(
      EnumeratedTextUtil.getPrintRequestStatus(printRequests[0].status),
    );
    expect(
      rows[0].queryByTestId("print-request-actions"),
    ).not.toBeInTheDocument();
  });

  it("should render correctly with canUpdate = true", async () => {
    const printRequests = [MockPrintRequestResponseDTO()];

    await renderWithProviders(
      <PrintRequestsPage
        printRequests={printRequests}
        canUpdate={true}
        onUpdate={jest.fn()}
      />,
    );

    expect(screen.getByTestId("print-requests-table")).toBeInTheDocument();

    const rows = screen.getAllByTestId("print-request-row");
    expect(rows).toHaveLength(printRequests.length);
    expect(
      rows[0].getByTestId("print-request-timestamp"),
    ).not.toBeEmptyDOMElement();
    expect(rows[0].getByTestId("print-request-contestant")).toHaveTextContent(
      printRequests[0].submission.member.name,
    );
    expect(rows[0].getByTestId("print-request-problem")).toHaveTextContent(
      printRequests[0].submission.problem.letter,
    );
    expect(rows[0].getByTestId("print-request-status")).toHaveTextContent(
      EnumeratedTextUtil.getPrintRequestStatus(printRequests[0].status),
    );
    expect(rows[0].queryByTestId("print-request-actions")).toBeInTheDocument();
  });
});
