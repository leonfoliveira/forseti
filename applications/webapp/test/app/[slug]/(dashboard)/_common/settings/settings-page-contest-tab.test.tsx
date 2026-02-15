import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { SettingsPageContestTab } from "@/app/[slug]/(dashboard)/_common/settings/settings-page-contest-tab";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { AdminDashboardState } from "@/app/_store/slices/admin-dashboard-slice";
import { contestWritter, leaderboardWritter } from "@/config/composition";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { MockDate } from "@/test/mock/mock-date";
import { MockContestFullResponseDTO } from "@/test/mock/response/contest/MockContestFullResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import {
  renderHookWithProviders,
  renderWithProviders,
} from "@/test/render-with-providers";

describe("SettingsPageContestTab", () => {
  const contest = MockContestFullResponseDTO();
  const leaderboard = MockLeaderboardResponseDTO();

  it("renders contest fields correctly", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={leaderboard}
        form={result.current}
      />,
      { contestMetadata },
    );

    fireEvent.change(screen.getByTestId("contest-slug"), {
      target: { value: "new-contest-slug" },
    });
    fireEvent.change(screen.getByTestId("contest-title"), {
      target: { value: "New Contest Title" },
    });
    fireEvent.change(screen.getByTestId("contest-start-at"), {
      target: { value: "2024-01-01T10:00" },
    });
    fireEvent.change(screen.getByTestId("contest-end-at"), {
      target: { value: "2024-01-01T12:00" },
    });
    fireEvent.change(screen.getByTestId("contest-auto-freeze-at"), {
      target: { value: "2024-01-01T11:00" },
    });
    fireEvent.click(screen.getByTestId("contest-language-PYTHON_312"));
    fireEvent.click(screen.getByTestId("contest-is-auto-judge-enabled"));

    expect(result.current.getValues()).toEqual({
      contest: {
        slug: "new-contest-slug",
        title: "New Contest Title",
        startAt: "2024-01-01T10:00",
        endAt: "2024-01-01T12:00",
        autoFreezeAt: "2024-01-01T11:00",
        languages: Object.keys(SubmissionLanguage).reduce(
          (acc, lang) => {
            acc[lang] = lang === "PYTHON_312" ? true : undefined;
            return acc;
          },
          {} as Record<string, boolean | undefined>,
        ),
        settings: {
          isAutoJudgeEnabled: true,
        },
      },
    });
  });

  it("should handle force start successfully", async () => {
    const contestMetadata = MockContestMetadataResponseDTO({
      startAt: MockDate.future().toISOString(),
      endAt: MockDate.future(2).toISOString(),
    });
    const newContestMetadata = MockContestMetadataResponseDTO();
    (contestWritter.forceStart as jest.Mock).mockResolvedValue(
      newContestMetadata,
    );
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    const { store } = await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={leaderboard}
        form={result.current}
      />,
      {
        contestMetadata,
        adminDashboard: {} as unknown as AdminDashboardState,
      },
    );

    fireEvent.click(screen.getByTestId("force-toggle-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(contestWritter.forceStart).toHaveBeenCalledWith(contest.id);
    expect(store.getState().adminDashboard.contest).toEqual({
      ...contest,
      ...newContestMetadata,
    });
    expect(store.getState().contestMetadata).toEqual(newContestMetadata);
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle force start error", async () => {
    const contestMetadata = MockContestMetadataResponseDTO({
      startAt: MockDate.future().toISOString(),
      endAt: MockDate.future(2).toISOString(),
    });
    (contestWritter.forceStart as jest.Mock).mockRejectedValue(
      new Error("Force start failed"),
    );
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={leaderboard}
        form={result.current}
      />,
      {
        contestMetadata,
        adminDashboard: {} as unknown as AdminDashboardState,
      },
    );

    fireEvent.click(screen.getByTestId("force-toggle-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(contestWritter.forceStart).toHaveBeenCalledWith(contest.id);
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should handle force end successfully", async () => {
    const contestMetadata = MockContestMetadataResponseDTO({
      startAt: MockDate.past().toISOString(),
      endAt: MockDate.future().toISOString(),
    });
    const newContestMetadata = MockContestMetadataResponseDTO();
    (contestWritter.forceEnd as jest.Mock).mockResolvedValue(
      newContestMetadata,
    );
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    const { store } = await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={leaderboard}
        form={result.current}
      />,
      {
        contestMetadata,
        adminDashboard: {} as unknown as AdminDashboardState,
      },
    );

    fireEvent.click(screen.getByTestId("force-toggle-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(contestWritter.forceEnd).toHaveBeenCalledWith(contest.id);
    expect(store.getState().adminDashboard.contest).toEqual({
      ...contest,
      ...newContestMetadata,
    });
    expect(store.getState().contestMetadata).toEqual(newContestMetadata);
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle force end error", async () => {
    const contestMetadata = MockContestMetadataResponseDTO({
      startAt: MockDate.past().toISOString(),
      endAt: MockDate.future().toISOString(),
    });
    (contestWritter.forceEnd as jest.Mock).mockRejectedValue(
      new Error("Force end failed"),
    );
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={leaderboard}
        form={result.current}
      />,
      {
        contestMetadata,
        adminDashboard: {} as unknown as AdminDashboardState,
      },
    );

    fireEvent.click(screen.getByTestId("force-toggle-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(contestWritter.forceEnd).toHaveBeenCalledWith(contest.id);
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should handle freeze successfully", async () => {
    const contestMetadata = MockContestMetadataResponseDTO({
      startAt: MockDate.past().toISOString(),
      endAt: MockDate.future().toISOString(),
    });
    const leaderboard = MockLeaderboardResponseDTO({ isFrozen: false });
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={leaderboard}
        form={result.current}
      />,
      {
        contestMetadata,
        adminDashboard: {} as unknown as AdminDashboardState,
      },
    );

    fireEvent.click(screen.getByTestId("freeze-toggle-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(leaderboardWritter.freeze).toHaveBeenCalledWith(contest.id);
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle freeze error", async () => {
    const contestMetadata = MockContestMetadataResponseDTO({
      startAt: MockDate.past().toISOString(),
      endAt: MockDate.future().toISOString(),
    });
    const leaderboard = MockLeaderboardResponseDTO({ isFrozen: false });
    (leaderboardWritter.freeze as jest.Mock).mockRejectedValue(
      new Error("Freeze failed"),
    );
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={leaderboard}
        form={result.current}
      />,
      {
        contestMetadata,
        adminDashboard: {} as unknown as AdminDashboardState,
      },
    );

    fireEvent.click(screen.getByTestId("freeze-toggle-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(leaderboardWritter.freeze).toHaveBeenCalledWith(contest.id);
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should not disable unfreeze button when contest is frozen", async () => {
    const contestMetadata = MockContestMetadataResponseDTO({
      startAt: MockDate.past().toISOString(),
      endAt: MockDate.past().toISOString(),
    });
    const leaderboard = MockLeaderboardResponseDTO({ isFrozen: true });
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={leaderboard}
        form={result.current}
      />,
      {
        contestMetadata,
        adminDashboard: {} as unknown as AdminDashboardState,
      },
    );

    const freezeToggleButton = screen.getByTestId("freeze-toggle-button");
    expect(freezeToggleButton).not.toBeDisabled();
  });

  it("should handle unfreeze successfully", async () => {
    const contestMetadata = MockContestMetadataResponseDTO({
      startAt: MockDate.past().toISOString(),
      endAt: MockDate.future().toISOString(),
    });
    const leaderboard = MockLeaderboardResponseDTO({ isFrozen: true });
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={leaderboard}
        form={result.current}
      />,
      {
        contestMetadata,
        adminDashboard: {} as unknown as AdminDashboardState,
      },
    );

    fireEvent.click(screen.getByTestId("freeze-toggle-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(leaderboardWritter.unfreeze).toHaveBeenCalledWith(contest.id);
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle unfreeze error", async () => {
    const contestMetadata = MockContestMetadataResponseDTO({
      startAt: MockDate.past().toISOString(),
      endAt: MockDate.future().toISOString(),
    });
    const leaderboard = MockLeaderboardResponseDTO({ isFrozen: true });
    (leaderboardWritter.unfreeze as jest.Mock).mockRejectedValue(
      new Error("Unfreeze failed"),
    );
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={leaderboard}
        form={result.current}
      />,
      {
        contestMetadata,
        adminDashboard: {} as unknown as AdminDashboardState,
      },
    );

    fireEvent.click(screen.getByTestId("freeze-toggle-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(leaderboardWritter.unfreeze).toHaveBeenCalledWith(contest.id);
    expect(useToast().error).toHaveBeenCalled();
  });
});
