import { act, render, screen, waitFor } from "@testing-library/react";

import { contestService } from "@/config/composition";
import { routes } from "@/config/routes";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestMetadataProvider } from "@/lib/provider/contest-metadata-provider";
import { contestMetadataSlice } from "@/store/slices/contest-metadata-slice";
import { mockAppDispatch, mockRouter } from "@/test/jest.setup";

jest.mock("@/config/composition");
jest.mock("@/lib/component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading" />,
}));
jest.mock("@/lib/component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error" />,
}));

describe("ContestMetadataProvider", () => {
  it("should render loading state initially", async () => {
    render(
      <ContestMetadataProvider slug="test-slug">
        <span data-testid="child" />
      </ContestMetadataProvider>,
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });
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

    expect(mockRouter.push).toHaveBeenCalledWith(routes.NOT_FOUND);
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
    const mockMetadata = {
      id: "1",
      name: "Test Contest",
    } as unknown as ContestMetadataResponseDTO;
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

    expect(mockAppDispatch).toHaveBeenCalledWith(
      contestMetadataSlice.actions.set(mockMetadata),
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error")).not.toBeInTheDocument();
  });
});
