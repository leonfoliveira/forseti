import RootContestsPage from "@/app/root/(dashboard)/contests/page";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { contestService } from "@/app/_composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { routes } from "@/app/_routes";
import { alert, redirect, router } from "@/test/jest.setup";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";

jest.mock("@/app/_composition", () => ({
  contestService: {
    findAllContestMetadata: jest.fn(),
    forceStart: jest.fn(),
    forceEnd: jest.fn(),
  },
}));

describe("RootContestsPage", () => {
  it("should redirect to sign-in page when findAll returns unauthorized", async () => {
    (contestService.findAllContestMetadata as jest.Mock).mockRejectedValueOnce(
      new UnauthorizedException("Unauthorized"),
    );

    render(<RootContestsPage />);

    await waitFor(() =>
      expect(redirect).toHaveBeenCalledWith(routes.ROOT_SIGN_IN()),
    );
  });

  it("should call alert.error when findAll fails with an error", async () => {
    (contestService.findAllContestMetadata as jest.Mock).mockRejectedValueOnce(
      new Error("Some error"),
    );

    render(<RootContestsPage />);

    await waitFor(() => expect(alert.error).toHaveBeenCalledWith("load-error"));
  });

  it("should render contests when findAll succeeds", async () => {
    const startAt = new Date();
    startAt.setHours(startAt.getHours() - 2);
    const endAt = new Date();
    endAt.setHours(endAt.getHours() - 1);
    const mockContests = [
      {
        id: "1",
        slug: "contest",
        title: "Contest",
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      },
    ] as ContestMetadataResponseDTO[];
    (contestService.findAllContestMetadata as jest.Mock).mockResolvedValueOnce(
      mockContests,
    );

    render(<RootContestsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("slug")).toHaveTextContent("contest");
      expect(screen.getByTestId("title")).toHaveTextContent("Contest");
      expect(screen.getByTestId("start-at")).toHaveTextContent(
        startAt.toISOString(),
      );
      expect(screen.getByTestId("end-at")).toHaveTextContent(
        endAt.toISOString(),
      );
      expect(screen.getByTestId("status")).toBeInTheDocument();
      expect(screen.getByTestId("start")).toBeDisabled();
      expect(screen.getByTestId("end")).toBeDisabled();
    });
    fireEvent.click(screen.getByTestId("new"));
    expect(router.push).toHaveBeenCalledWith(routes.ROOT_CONTESTS_NEW);
  });
});
