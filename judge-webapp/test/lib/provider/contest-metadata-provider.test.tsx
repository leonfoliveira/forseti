import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { act } from "react";

import { contestService } from "@/config/composition";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestMetadataProvider } from "@/lib/provider/contest-metadata-provider";
import { contestMetadataSlice } from "@/store/slices/contest-metadata-slice";
import { mockAppDispatch, mockUseAppSelector } from "@/test/jest.setup";

jest.mock("@/lib/component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading" />,
}));
jest.mock("@/lib/component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error" />,
}));

describe("ContestMetadataProvider", () => {
  it("should render loading state while loading contest metadata", async () => {
    mockUseAppSelector.mockReturnValue({ isLoading: true, error: null });
    const metadata = { id: "123" } as ContestMetadataResponseDTO;
    (contestService.findContestMetadataBySlug as jest.Mock).mockResolvedValue(
      metadata,
    );

    await act(async () => {
      render(
        <ContestMetadataProvider slug="test-slug">
          <span data-testid="child" />
        </ContestMetadataProvider>,
      );
    });

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    expect(contestService.findContestMetadataBySlug).toHaveBeenCalledWith(
      "test-slug",
    );
    expect(mockAppDispatch).toHaveBeenCalledWith(
      contestMetadataSlice.actions.success(metadata),
    );
  });

  it("should render error state on error", async () => {
    const error = new Error();
    mockUseAppSelector.mockReturnValue({
      isLoading: false,
      error,
    });
    (contestService.findContestMetadataBySlug as jest.Mock).mockRejectedValue(
      error,
    );

    await act(async () => {
      render(
        <ContestMetadataProvider slug="test-slug">
          <span data-testid="child" />
        </ContestMetadataProvider>,
      );
    });

    expect(screen.getByTestId("error")).toBeInTheDocument();
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    expect(contestService.findContestMetadataBySlug).toHaveBeenCalledWith(
      "test-slug",
    );
    expect(mockAppDispatch).toHaveBeenCalledWith(
      contestMetadataSlice.actions.fail(error),
    );
  });

  it("should render child on success", () => {
    mockUseAppSelector.mockReturnValue({
      isLoading: false,
      error: null,
    });

    render(
      <ContestMetadataProvider slug="test-slug">
        <span data-testid="child" />
      </ContestMetadataProvider>,
    );

    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
