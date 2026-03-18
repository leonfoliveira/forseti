import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { SubmissionsPageActionExecutions } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-executions";
import { DropdownMenu } from "@/app/_lib/component/shadcn/dropdown-menu";
import { Composition } from "@/config/composition";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockExecutionResponseDTO } from "@/test/mock/response/execution/MockExecutionResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionExecutions", () => {
  it("should render the executions in a table", async () => {
    const executions = [MockExecutionResponseDTO()];

    await renderWithProviders(
      <DropdownMenu open>
        <SubmissionsPageActionExecutions
          executions={executions}
          onClose={() => {}}
        />
        ,
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
    ).toHaveTextContent("10/10");
    expect(
      screen.getByTestId("submission-execution-max-time"),
    ).toHaveTextContent("1000 ms / 2000 ms");
    expect(
      screen.getByTestId("submission-execution-max-peak-memory"),
    ).toHaveTextContent("1024000 KB");
    expect(screen.getByTestId("submission-execution-details")).toBeEnabled();
  });

  it("should handle file download", async () => {
    const executions = [MockExecutionResponseDTO()];
    const contest = MockContestResponseDTO();

    await renderWithProviders(
      <DropdownMenu open>
        <SubmissionsPageActionExecutions
          executions={executions}
          onClose={() => {}}
        />
        ,
      </DropdownMenu>,
      {
        contest,
      },
    );

    act(() => {
      fireEvent.click(screen.getByTestId("submissions-page-action-executions"));
    });

    fireEvent.click(screen.getByTestId("submission-execution-details"));
    expect(Composition.attachmentReader.download).toHaveBeenCalledWith(
      contest.id,
      executions[0].details,
    );
  });
});
