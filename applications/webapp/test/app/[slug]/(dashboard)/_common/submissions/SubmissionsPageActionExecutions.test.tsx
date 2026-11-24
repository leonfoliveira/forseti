import { fireEvent,screen } from "@testing-library/react";

import { SubmissionsPageActionExecutions } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionExecutions";
import { Composition } from "@/config/composition";
import { MockExecutionResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionExecutions", () => {
  it("renders the executions dialog", async () => {
    const executions = [MockExecutionResponseDTO(), MockExecutionResponseDTO()];
    const onCloseFn = jest.fn();

    await renderWithProviders(
      <SubmissionsPageActionExecutions
        executions={executions}
        onClose={onCloseFn}
      />,
    );

    expect(
      screen.getByTestId("submissions-page-action-executions"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("submission-executions-table"),
    ).toBeInTheDocument();

    for (let i = 0; i < executions.length; i++) {
      const row = screen.getAllByTestId(`submission-execution-row`)[i];
      expect(
        row.getByTestId("submission-execution-timestamp"),
      ).not.toBeEmptyDOMElement();
      expect(row.getByTestId("submission-execution-answer")).toHaveTextContent(
        "Accepted",
      );
      expect(
        row.getByTestId("submission-execution-test-cases"),
      ).toHaveTextContent(
        `${executions[i].approvedTestCases}/${executions[i].totalTestCases}`,
      );
      expect(
        row.getByTestId("submission-execution-max-time"),
      ).toHaveTextContent(
        `${executions[i].maxCpuTimeMs} ms / ${executions[i].maxClockTimeMs} ms`,
      );
      expect(
        row.getByTestId("submission-execution-max-peak-memory"),
      ).toHaveTextContent(`${executions[i].maxPeakMemoryKb} KB`);
      expect(
        row.getByTestId("submission-execution-details"),
      ).toBeInTheDocument();

      fireEvent.click(row.getByTestId("submission-execution-details"));

      expect(Composition.attachmentReader.download).toHaveBeenCalledWith(
        expect.any(String),
        executions[i].details,
      );
    }
  });
});
