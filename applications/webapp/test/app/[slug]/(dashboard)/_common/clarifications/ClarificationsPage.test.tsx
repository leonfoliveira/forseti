import { fireEvent, screen } from "@testing-library/dom";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPage";
import { MockDate } from "@/test/mock/MockDate";
import {
  MockClarificationResponseDTO,
  MockContestResponseDTO,
  MockProblemResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ClarificationsPage", () => {
  const contest = MockContestResponseDTO({
    startAt: MockDate.past().toISOString(),
    endAt: MockDate.future().toISOString(),
  });
  const problems = [MockProblemResponseDTO(), MockProblemResponseDTO()];
  const clarifications = [
    MockClarificationResponseDTO({ answer: undefined }),
    MockClarificationResponseDTO({
      problem: undefined,
    }),
  ];

  it("should render variant with no clarification", async () => {
    await renderWithProviders(
      <ClarificationsPage problems={problems} clarifications={[]} />,
      { contest },
    );

    expect(screen.queryAllByTestId("clarification-card").length).toBe(0);
    expect(screen.getByTestId("empty")).toBeInTheDocument();
  });

  it("should render list of clarifications", async () => {
    await renderWithProviders(
      <ClarificationsPage
        problems={problems}
        clarifications={clarifications}
      />,
      { contest },
    );

    expect(screen.queryAllByTestId("clarification-card").length).toBe(2);
    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();
  });

  it("should render form when canCreate is true and open form", async () => {
    await renderWithProviders(
      <ClarificationsPage
        problems={problems}
        clarifications={clarifications}
        canCreate
        onCreate={() => {}}
      />,
      { contest },
    );

    expect(screen.getByTestId("open-create-form-button")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("open-create-form-button"));
    expect(screen.getByTestId("clarification-form")).toBeInTheDocument();
  });

  it("should not render form when contest is ended", async () => {
    const pastContestMetadata = MockContestResponseDTO({
      startAt: MockDate.past(10).toISOString(),
      endAt: MockDate.past(5).toISOString(),
    });

    await renderWithProviders(
      <ClarificationsPage
        problems={problems}
        clarifications={clarifications}
        canCreate
        onCreate={() => {}}
      />,
      { contest: pastContestMetadata },
    );

    expect(
      screen.queryByTestId("open-create-form-button"),
    ).not.toBeInTheDocument();
  });
});
