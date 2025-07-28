import { ContestMetadataProvider } from "@/app/contests/[slug]/_context/contest-metadata-context";
import { act, render, screen } from "@testing-library/react";
import { contestService } from "@/config/composition";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { mockRedirect } from "@/test/jest.setup";
import { routes } from "@/config/routes";

jest.mock("@/config/composition");
jest.mock("@/app/_component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading" />,
}));
jest.mock("@/app/_component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error" />,
}));

describe("ContestMetadataProvider", () => {
  it("should render loading state initially", () => {
    render(
      <ContestMetadataProvider slug="test-slug">
        <span data-testid="child" />
      </ContestMetadataProvider>,
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("should redirect to not found on NotFoundException", async () => {
    (contestService.findContestMetadataBySlug as jest.Mock).mockRejectedValue(
      new NotFoundException("Contest not found"),
    );

    await act(async () => {
      render(
        <ContestMetadataProvider slug="test-slug">
          <span data-testid="child" />
        </ContestMetadataProvider>,
      );
    });

    expect(mockRedirect).toHaveBeenCalledWith(routes.NOT_FOUND);
  });

  it("should render error state on failure", async () => {
    (contestService.findContestMetadataBySlug as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    await act(async () => {
      render(
        <ContestMetadataProvider slug="test-slug">
          <span data-testid="child" />
        </ContestMetadataProvider>,
      );
    });

    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.getByTestId("error")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("should render contest metadata on success", async () => {
    const mockMetadata = { id: "1", name: "Test Contest" };
    (contestService.findContestMetadataBySlug as jest.Mock).mockResolvedValue(
      mockMetadata,
    );

    await act(async () => {
      render(
        <ContestMetadataProvider slug="test-slug">
          <span data-testid="child" />
        </ContestMetadataProvider>,
      );
    });

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error")).not.toBeInTheDocument();
  });
});
