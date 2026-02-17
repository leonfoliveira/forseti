import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { SubmissionsPageActionExecutions } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-executions";
import { DropdownMenu } from "@/app/_lib/component/shadcn/dropdown-menu";
import { attachmentReader } from "@/config/composition";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockExecutionResponseDTO } from "@/test/mock/response/execution/MockExecutionResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionExecutions", () => {
  it("should render the executions in a table", async () => {
    const executions = [MockExecutionResponseDTO()];

    await renderWithProviders(
      <DropdownMenu open>
        <SubmissionsPageActionExecutions executions={executions} />,
      </DropdownMenu>,
    );

    act(() => {
      fireEvent.click(screen.getByTestId("submissions-page-action-executions"));
    });

    expect(
      screen.getByTestId("submission-execution-timestamp"),
    ).not.toBeEmptyDOMElement();
    expect(screen.getByTestId("submission-execution-status")).toHaveTextContent(
      "Accepted",
    );
    expect(
      screen.getByTestId("submission-execution-test-cases"),
    ).toHaveTextContent("1/10");
    expect(screen.getByTestId("submission-execution-input")).toBeEnabled();
    expect(screen.getByTestId("submission-execution-output")).toBeEnabled();
  });

  it("should show 0 test cases last test case is undefined", async () => {
    const executions = [
      MockExecutionResponseDTO({
        lastTestCase: undefined,
      }),
    ];

    await renderWithProviders(
      <DropdownMenu open>
        <SubmissionsPageActionExecutions executions={executions} />,
      </DropdownMenu>,
    );

    act(() => {
      fireEvent.click(screen.getByTestId("submissions-page-action-executions"));
    });

    expect(
      screen.getByTestId("submission-execution-test-cases"),
    ).toHaveTextContent("0/10");
  });

  it("should handle file download", async () => {
    const executions = [MockExecutionResponseDTO()];
    const contestMetadata = MockContestMetadataResponseDTO();

    await renderWithProviders(
      <DropdownMenu open>
        <SubmissionsPageActionExecutions executions={executions} />,
      </DropdownMenu>,
      {
        contestMetadata,
      },
    );

    act(() => {
      fireEvent.click(screen.getByTestId("submissions-page-action-executions"));
    });

    fireEvent.click(screen.getByTestId("submission-execution-input"));
    expect(attachmentReader.download).toHaveBeenCalledWith(
      contestMetadata.id,
      executions[0].input,
    );

    fireEvent.click(screen.getByTestId("submission-execution-output"));
    expect(attachmentReader.download).toHaveBeenCalledWith(
      contestMetadata.id,
      executions[0].output,
    );
  });
});
