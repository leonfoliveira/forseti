import { screen } from "@testing-library/dom";

import DashboardAboutPage from "@/app/[slug]/(dashboard)/about/page";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("Dashboard > About", () => {
  test("should render contest details", async () => {
    const contest = MockContestResponseDTO();
    await renderWithProviders(<DashboardAboutPage />, { contest });

    expect(screen.getByTestId("title")).toHaveTextContent(contest.title);
    expect(screen.getByTestId("start-at")).toHaveTextContent(
      "01/01/2025, 10:00:00 AM",
    );
    expect(screen.getByTestId("end-at")).toHaveTextContent(
      "01/01/2025, 03:00:00 PM",
    );
    expect(screen.getByTestId("auto-freeze-at")).toHaveTextContent(
      "01/01/2025, 02:00:00 PM",
    );
    contest.languages.forEach((lang) => {
      expect(screen.getByTestId(`language-${lang}`)).toBeInTheDocument();
    });
    expect(screen.getByTestId("auto-judge-enabled")).toBeInTheDocument();
    expect(screen.getByTestId("clarification-enabled")).toBeInTheDocument();
    expect(
      screen.getByTestId("submission-print-ticket-enabled"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("technical-support-ticket-enabled"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("non-technical-support-ticket-enabled"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("guest-enabled")).toBeInTheDocument();
  });

  test("should render auto freeze disabled when auto freeze is not set", async () => {
    const contest = MockContestResponseDTO({
      autoFreezeAt: undefined,
    });
    await renderWithProviders(<DashboardAboutPage />, { contest });

    expect(screen.getByTestId("auto-freeze-at")).toHaveTextContent("Disabled");
  });

  test("should render disabled settings correctly", async () => {
    const contest = MockContestResponseDTO({
      settings: {
        isAutoJudgeEnabled: false,
        isClarificationEnabled: false,
        isSubmissionPrintTicketEnabled: false,
        isTechnicalSupportTicketEnabled: false,
        isNonTechnicalSupportTicketEnabled: false,
        isGuestEnabled: false,
      },
    });
    await renderWithProviders(<DashboardAboutPage />, { contest });

    expect(screen.getByTestId("auto-judge-disabled")).toBeInTheDocument();
    expect(screen.getByTestId("clarification-disabled")).toBeInTheDocument();
    expect(
      screen.getByTestId("submission-print-ticket-disabled"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("technical-support-ticket-disabled"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("non-technical-support-ticket-disabled"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("guest-disabled")).toBeInTheDocument();
  });
});
