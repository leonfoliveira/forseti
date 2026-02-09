import { fireEvent, screen } from "@testing-library/dom";
import { v4 as uuidv4 } from "uuid";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ClarificationsPage", () => {
  const contestId = uuidv4();
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
      <ClarificationsPage
        contestId={contestId}
        problems={problems}
        clarifications={[]}
      />,
    );

    expect(screen.queryAllByTestId("clarification-card").length).toBe(0);
    expect(screen.getByTestId("empty")).toBeInTheDocument();
  });

  it("should render list of clarifications", async () => {
    await renderWithProviders(
      <ClarificationsPage
        contestId={contestId}
        problems={problems}
        clarifications={clarifications}
      />,
    );

    expect(screen.queryAllByTestId("clarification-card").length).toBe(2);
    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();
  });

  it("should render form when canCreate is true and open form", async () => {
    await renderWithProviders(
      <ClarificationsPage
        contestId={contestId}
        problems={problems}
        clarifications={clarifications}
        canCreate
      />,
    );

    expect(screen.getByTestId("open-create-form-button")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("open-create-form-button"));
    expect(screen.getByTestId("clarification-form")).toBeInTheDocument();
  });
});
