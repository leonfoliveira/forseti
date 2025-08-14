import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import RootContestsPage from "@/app/root/(dashboard)/contests/page";
import { contestService } from "@/config/composition";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { useContestStatusWatcherBatch } from "@/lib/util/contest-status-watcher";
import { mockAlert, mockRouter } from "@/test/jest.setup";

jest.mock("@/config/composition");
jest.mock("@/lib/util/contest-status-watcher", () => ({
  useContestStatusWatcherBatch: jest.fn().mockReturnValue({}),
}));
jest.mock("@/lib/component/badge/contest-status-badge");
jest.mock("@/lib/component/modal/dialog-modal", () => ({
  DialogModal: ({ children, modal, onConfirm, isLoading }: any) => (
    <>
      {modal.isOpen && (
        <div data-testid="dialog-modal">
          {children}
          {isLoading && <span data-testid="dialog-modal:loading" />}
          <button
            onClick={onConfirm}
            data-testid="dialog-modal:button"
          ></button>
        </div>
      )}
    </>
  ),
}));

describe("RootContestsPage", () => {
  it("should alert error on findAll failure", async () => {
    (contestService.findAllContestMetadata as jest.Mock).mockRejectedValue(
      new Error("error"),
    );

    await act(async () => {
      render(<RootContestsPage />);
    });

    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "Failed to load contests",
      id: "app.root.(dashboard).contests.page.load-error",
    });
  });

  it("should render contests when findAll is successful", async () => {
    const mockContests = [
      {
        id: "1",
        slug: "contest",
        title: "Contest",
        startAt: "2025-01-01T00:00:00Z",
        endAt: "2025-01-01T12:00:00Z",
      },
    ] as ContestMetadataResponseDTO[];
    (contestService.findAllContestMetadata as jest.Mock).mockResolvedValue(
      mockContests,
    );

    render(<RootContestsPage />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("header-slug")).toHaveTextContent("Slug");
    expect(screen.getByTestId("header-title")).toHaveTextContent("Title");
    expect(screen.getByTestId("header-start-at")).toHaveTextContent("Start At");
    expect(screen.getByTestId("header-end-at")).toHaveTextContent("End At");
    expect(screen.getByTestId("header-status")).toHaveTextContent("Status");
    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(1);
    expect(screen.getByTestId("slug")).toHaveTextContent(mockContests[0].slug);
    expect(screen.getByTestId("title")).toHaveTextContent(
      mockContests[0].title,
    );
    expect(screen.getByTestId("start-at")).toHaveTextContent(
      mockContests[0].startAt,
    );
    expect(screen.getByTestId("end-at")).toHaveTextContent(
      mockContests[0].endAt,
    );
  });

  it("should redirect to new contest page on new contest button click", async () => {
    await act(async () => {
      render(<RootContestsPage />);
    });

    fireEvent.click(screen.getByTestId("new"));
    expect(mockRouter.push).toHaveBeenCalledWith(routes.ROOT_CONTESTS_NEW);
  });

  it("should redirect to edit contest page on view button click", async () => {
    const mockContests = [{ id: "1" }] as ContestMetadataResponseDTO[];
    (contestService.findAllContestMetadata as jest.Mock).mockResolvedValue(
      mockContests,
    );

    await act(async () => {
      render(<RootContestsPage />);
    });

    fireEvent.click(screen.getByTestId("view"));
    expect(mockRouter.push).toHaveBeenCalledWith(
      routes.ROOT_CONTESTS_EDIT(mockContests[0].id),
    );
  });

  it("should render with action buttons disabled when contest is ended", async () => {
    const mockContests = [{ id: "1" }] as ContestMetadataResponseDTO[];
    (contestService.findAllContestMetadata as jest.Mock).mockResolvedValue(
      mockContests,
    );
    (useContestStatusWatcherBatch as jest.Mock).mockReturnValue({
      "1": ContestStatus.ENDED,
    });

    await act(async () => {
      render(<RootContestsPage />);
    });

    expect(screen.getByTestId("start")).toBeDisabled();
    expect(screen.getByTestId("end")).toBeDisabled();
  });

  it("should render error on start contest failure", async () => {
    const mockContests = [{ id: "1" }] as ContestMetadataResponseDTO[];
    (contestService.findAllContestMetadata as jest.Mock).mockResolvedValue(
      mockContests,
    );
    (contestService.forceStart as jest.Mock).mockRejectedValue(
      new Error("error"),
    );
    (useContestStatusWatcherBatch as jest.Mock).mockReturnValue({
      "1": ContestStatus.NOT_STARTED,
    });

    await act(async () => {
      render(<RootContestsPage />);
    });

    const startButton = screen.getByTestId("start");
    expect(startButton).toBeEnabled();
    expect(screen.getByTestId("end")).toBeDisabled();
    act(() => {
      fireEvent.click(startButton);
    });
    expect(screen.getByTestId("dialog-modal")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-modal")).toHaveTextContent(
      "Are you sure you want to start this contest now?",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });
    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "Failed to start contest",
      id: "app.root.(dashboard).contests.page.start-error",
    });
  });

  it("should render success on start contest", async () => {
    const mockContests = [{ id: "1" }] as ContestMetadataResponseDTO[];
    (contestService.findAllContestMetadata as jest.Mock).mockResolvedValue(
      mockContests,
    );
    (contestService.forceStart as jest.Mock).mockResolvedValue({
      ...mockContests[0],
    });
    (useContestStatusWatcherBatch as jest.Mock).mockReturnValue({
      "1": ContestStatus.NOT_STARTED,
    });

    await act(async () => {
      render(<RootContestsPage />);
    });

    const startButton = screen.getByTestId("start");
    expect(startButton).toBeEnabled();
    act(() => {
      fireEvent.click(startButton);
    });
    expect(screen.getByTestId("dialog-modal")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-modal")).toHaveTextContent(
      "Are you sure you want to start this contest now?",
    );
    expect(
      screen.queryByTestId("dialog-modal:loading"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("dialog-modal:button"));
    expect(screen.getByTestId("dialog-modal:loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByTestId("dialog-modal:loading"),
      ).not.toBeInTheDocument();
    });
    expect(mockAlert.success).toHaveBeenCalledWith({
      defaultMessage: "Contest started successfully",
      id: "app.root.(dashboard).contests.page.start-success",
    });
    expect(screen.queryByTestId("dialog-modal")).not.toBeInTheDocument();
  });

  it("should render error on start contest failure", async () => {
    const mockContests = [{ id: "1" }] as ContestMetadataResponseDTO[];
    (contestService.findAllContestMetadata as jest.Mock).mockResolvedValue(
      mockContests,
    );
    (contestService.forceEnd as jest.Mock).mockRejectedValue(
      new Error("error"),
    );
    (useContestStatusWatcherBatch as jest.Mock).mockReturnValue({
      "1": ContestStatus.IN_PROGRESS,
    });

    await act(async () => {
      render(<RootContestsPage />);
    });

    const endButton = screen.getByTestId("end");
    expect(endButton).toBeEnabled();
    expect(screen.getByTestId("start")).toBeDisabled();
    act(() => {
      fireEvent.click(endButton);
    });
    expect(screen.getByTestId("dialog-modal")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-modal")).toHaveTextContent(
      "Are you sure you want to end this contest now?",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });
    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "Failed to end contest",
      id: "app.root.(dashboard).contests.page.end-error",
    });
  });

  it("should render success on end contest", async () => {
    const mockContests = [{ id: "1" }] as ContestMetadataResponseDTO[];
    (contestService.findAllContestMetadata as jest.Mock).mockResolvedValue(
      mockContests,
    );
    (contestService.forceEnd as jest.Mock).mockResolvedValue({
      ...mockContests[0],
    });
    (useContestStatusWatcherBatch as jest.Mock).mockReturnValue({
      "1": ContestStatus.IN_PROGRESS,
    });

    await act(async () => {
      render(<RootContestsPage />);
    });

    const endButton = screen.getByTestId("end");
    expect(endButton).toBeEnabled();
    act(() => {
      fireEvent.click(endButton);
    });
    expect(screen.getByTestId("dialog-modal")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-modal")).toHaveTextContent(
      "Are you sure you want to end this contest now?",
    );
    expect(
      screen.queryByTestId("dialog-modal:loading"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("dialog-modal:button"));
    expect(screen.getByTestId("dialog-modal:loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByTestId("dialog-modal:loading"),
      ).not.toBeInTheDocument();
    });
    expect(mockAlert.success).toHaveBeenCalledWith({
      defaultMessage: "Contest ended successfully",
      id: "app.root.(dashboard).contests.page.end-success",
    });
    expect(screen.queryByTestId("dialog-modal")).not.toBeInTheDocument();
  });
});
