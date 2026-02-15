import { fireEvent, screen } from "@testing-library/dom";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page";
import { MockDate } from "@/test/mock/mock-date";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ClarificationsPage", () => {
  const contestMetadata = MockContestMetadataResponseDTO({
    startAt: MockDate.past().toISOString(),
    endAt: MockDate.future().toISOString(),
  });
  const problems = [
    MockProblemPublicResponseDTO(),
    MockProblemPublicResponseDTO(),
  ];
  const clarifications = [
    MockClarificationResponseDTO(),
    MockClarificationResponseDTO({
      problem: undefined,
      children: [MockClarificationResponseDTO()],
    }),
  ];

  it("should render variant with no clarification", async () => {
    await renderWithProviders(
      <ClarificationsPage problems={problems} clarifications={[]} />,
      { contestMetadata },
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
      { contestMetadata },
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
      { contestMetadata },
    );

    expect(screen.getByTestId("open-create-form-button")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("open-create-form-button"));
    expect(screen.getByTestId("clarification-form")).toBeInTheDocument();
  });

  it("should not render form when contest is ended", async () => {
    const pastContestMetadata = MockContestMetadataResponseDTO({
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
      { contestMetadata: pastContestMetadata },
    );

    expect(
      screen.queryByTestId("open-create-form-button"),
    ).not.toBeInTheDocument();
  });
});
