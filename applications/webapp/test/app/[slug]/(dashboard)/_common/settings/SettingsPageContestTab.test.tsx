import React from "react";
import { screen, fireEvent, act } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { SettingsPageContestTab } from "@/app/[slug]/(dashboard)/_common/settings/SettingsPageContestTab";
import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";

import {
  MockContestWithMembersAndProblemsDTO,
  MockLeaderboardResponseDTO,
} from "@/test/mock/response/MockDTOs";
import {
  renderHookWithProviders,
  renderWithProviders,
} from "@/test/render-with-providers";
import { Composition } from "@/config/composition";
import { useToast } from "@/app/_lib/hook/useToast";
import { useContestStatusWatcher } from "@/app/_lib/hook/useContestStatusWatcher";

jest.mock("@/app/_lib/hook/useContestStatusWatcher", () => ({
  useContestStatusWatcher: jest.fn(() => ContestStatus.NOT_STARTED),
}));

describe("SettingsPageContestTab", () => {
  it("fills contest fields", async () => {
    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    await renderWithProviders(
      <SettingsPageContestTab
        contest={MockContestWithMembersAndProblemsDTO()}
        leaderboard={MockLeaderboardResponseDTO()}
        form={form.current}
      />,
    );

    fireEvent.change(screen.getByTestId("contest-slug"), {
      target: { value: "new-slug" },
    });
    fireEvent.change(screen.getByTestId("contest-title"), {
      target: { value: "New Contest Title" },
    });
    fireEvent.change(screen.getByTestId("contest-start-at"), {
      target: { value: "2024-06-01T10:00" },
    });
    fireEvent.change(screen.getByTestId("contest-end-at"), {
      target: { value: "2024-06-01T12:00" },
    });
    fireEvent.change(screen.getByTestId("contest-auto-freeze-at"), {
      target: { value: "2024-06-01T11:00" },
    });
    fireEvent.change(screen.getByTestId("contest-ip-cidrs"), {
      target: { value: "0.0.0.0/0" },
    });
    fireEvent.click(screen.getByTestId("contest-language-CPP_17"));
    fireEvent.click(screen.getByTestId("contest-auto-judge-enabled"));
    fireEvent.click(screen.getByTestId("contest-clarification-enabled"));
    fireEvent.click(screen.getByTestId("contest-print-request-enabled"));
    fireEvent.click(screen.getByTestId("contest-spectator-enabled"));

    expect(form.current.getValues()).toEqual(
      expect.objectContaining({
        contest: expect.objectContaining({
          slug: "new-slug",
          title: "New Contest Title",
          startAt: "2024-06-01T10:00",
          endAt: "2024-06-01T12:00",
          autoFreezeAt: "2024-06-01T11:00",
          ipCIDRs: "0.0.0.0/0",
          languages: {
            ...Object.keys(SubmissionLanguage).reduce(
              (acc, lang) => {
                (acc as any)[lang] = undefined as any;
                return acc;
              },
              {} as Record<keyof typeof SubmissionLanguage, boolean>,
            ),
            CPP_17: true,
          },
          settings: {
            isAutoJudgeEnabled: true,
            isClarificationEnabled: true,
            isPrintRequestEnabled: true,
            isSpectatorEnabled: true,
          },
        }),
      }),
    );
  });

  it("freezes contest successfully", async () => {
    const contest = MockContestWithMembersAndProblemsDTO({
      frozenAt: undefined,
    });
    const updatedContest = MockContestWithMembersAndProblemsDTO();
    (Composition.contestWriter.freeze as jest.Mock).mockResolvedValue(
      updatedContest,
    );
    (useContestStatusWatcher as jest.Mock).mockReturnValue(
      ContestStatus.IN_PROGRESS,
    );

    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    const { store } = await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
        form={form.current}
      />,
    );

    expect(screen.getByTestId("freeze-toggle-button")).toHaveTextContent(
      "Freeze",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("freeze-toggle-button"));
    });
    await act(async () => {
      fireEvent.click(
        screen.getAllByTestId("confirmation-dialog-confirm-button")[0],
      );
    });

    expect(Composition.contestWriter.freeze).toHaveBeenCalledWith(contest.id);
    expect(useToast().success).toHaveBeenCalled();
    expect(store.getState().adminDashboard.contest).toEqual(updatedContest);
    expect(store.getState().contest).toEqual(updatedContest);
  });

  it("shows toast on freeze failure", async () => {
    const contest = MockContestWithMembersAndProblemsDTO({
      frozenAt: undefined,
    });
    (Composition.contestWriter.freeze as jest.Mock).mockRejectedValue(
      new Error("Freeze failed"),
    );
    (useContestStatusWatcher as jest.Mock).mockReturnValue(
      ContestStatus.IN_PROGRESS,
    );

    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
        form={form.current}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("freeze-toggle-button"));
    });
    await act(async () => {
      fireEvent.click(
        screen.getAllByTestId("confirmation-dialog-confirm-button")[0],
      );
    });

    expect(Composition.contestWriter.freeze).toHaveBeenCalledWith(contest.id);
    expect(useToast().error).toHaveBeenCalled();
  });

  it("unfreezes contest successfully", async () => {
    const contest = MockContestWithMembersAndProblemsDTO({
      frozenAt: new Date().toISOString(),
    });
    const updatedContest = MockContestWithMembersAndProblemsDTO({
      frozenAt: undefined,
    });
    (Composition.contestWriter.unfreeze as jest.Mock).mockResolvedValue(
      updatedContest,
    );
    (useContestStatusWatcher as jest.Mock).mockReturnValue(
      ContestStatus.IN_PROGRESS,
    );

    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    const { store } = await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
        form={form.current}
      />,
    );

    expect(screen.getByTestId("freeze-toggle-button")).toHaveTextContent(
      "Unfreeze",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("freeze-toggle-button"));
    });
    await act(async () => {
      fireEvent.click(
        screen.getAllByTestId("confirmation-dialog-confirm-button")[0],
      );
    });

    expect(Composition.contestWriter.unfreeze).toHaveBeenCalledWith(contest.id);
    expect(useToast().success).toHaveBeenCalled();
    expect(store.getState().adminDashboard.contest).toEqual(updatedContest);
    expect(store.getState().contest).toEqual(updatedContest);
  });

  it("shows toast on unfreeze failure", async () => {
    const contest = MockContestWithMembersAndProblemsDTO({
      frozenAt: new Date().toISOString(),
    });
    (Composition.contestWriter.unfreeze as jest.Mock).mockRejectedValue(
      new Error("Unfreeze failed"),
    );
    (useContestStatusWatcher as jest.Mock).mockReturnValue(
      ContestStatus.IN_PROGRESS,
    );

    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
        form={form.current}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("freeze-toggle-button"));
    });
    await act(async () => {
      fireEvent.click(
        screen.getAllByTestId("confirmation-dialog-confirm-button")[0],
      );
    });

    expect(Composition.contestWriter.unfreeze).toHaveBeenCalledWith(contest.id);
    expect(useToast().error).toHaveBeenCalled();
  });

  it("disables freeze button when contest is not started", async () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    (useContestStatusWatcher as jest.Mock).mockReturnValue(
      ContestStatus.NOT_STARTED,
    );

    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
        form={form.current}
      />,
    );

    expect(screen.getByTestId("freeze-toggle-button")).toBeDisabled();
  });

  it("disables freeze button when contest has ended and it is not frozen", async () => {
    const contest = MockContestWithMembersAndProblemsDTO({
      frozenAt: undefined,
    });
    (useContestStatusWatcher as jest.Mock).mockReturnValue(ContestStatus.ENDED);

    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
        form={form.current}
      />,
    );

    expect(screen.getByTestId("freeze-toggle-button")).toBeDisabled();
  });

  it("force start contest", async () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    const updatedContest = MockContestWithMembersAndProblemsDTO();
    (Composition.contestWriter.forceStart as jest.Mock).mockResolvedValue(
      updatedContest,
    );
    (useContestStatusWatcher as jest.Mock).mockReturnValue(
      ContestStatus.NOT_STARTED,
    );

    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    const { store } = await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
        form={form.current}
      />,
    );

    expect(screen.getByTestId("force-toggle-button")).toHaveTextContent(
      "Force Start",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("force-toggle-button"));
    });
    await act(async () => {
      fireEvent.click(
        screen.getAllByTestId("confirmation-dialog-confirm-button")[1],
      );
    });

    expect(Composition.contestWriter.forceStart).toHaveBeenCalledWith(
      contest.id,
    );
    expect(useToast().success).toHaveBeenCalled();
    expect(store.getState().adminDashboard.contest).toEqual(updatedContest);
    expect(store.getState().contest).toEqual(updatedContest);
  });

  it("show toast on force start failure", async () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    (Composition.contestWriter.forceStart as jest.Mock).mockRejectedValue(
      new Error("Force start failed"),
    );
    (useContestStatusWatcher as jest.Mock).mockReturnValue(
      ContestStatus.NOT_STARTED,
    );

    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
        form={form.current}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("force-toggle-button"));
    });
    await act(async () => {
      fireEvent.click(
        screen.getAllByTestId("confirmation-dialog-confirm-button")[1],
      );
    });

    expect(Composition.contestWriter.forceStart).toHaveBeenCalledWith(
      contest.id,
    );
    expect(useToast().error).toHaveBeenCalled();
  });

  it("force end contest", async () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    const updatedContest = MockContestWithMembersAndProblemsDTO();
    (Composition.contestWriter.forceEnd as jest.Mock).mockResolvedValue(
      updatedContest,
    );
    (useContestStatusWatcher as jest.Mock).mockReturnValue(
      ContestStatus.IN_PROGRESS,
    );

    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    const { store } = await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
        form={form.current}
      />,
    );

    expect(screen.getByTestId("force-toggle-button")).toHaveTextContent(
      "Force End",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("force-toggle-button"));
    });
    await act(async () => {
      fireEvent.click(
        screen.getAllByTestId("confirmation-dialog-confirm-button")[1],
      );
    });

    expect(Composition.contestWriter.forceEnd).toHaveBeenCalledWith(contest.id);
    expect(useToast().success).toHaveBeenCalled();
    expect(store.getState().adminDashboard.contest).toEqual(updatedContest);
    expect(store.getState().contest).toEqual(updatedContest);
  });

  it("show toast on force end failure", async () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    (Composition.contestWriter.forceEnd as jest.Mock).mockRejectedValue(
      new Error("Force end failed"),
    );
    (useContestStatusWatcher as jest.Mock).mockReturnValue(
      ContestStatus.IN_PROGRESS,
    );

    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
        form={form.current}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("force-toggle-button"));
    });
    await act(async () => {
      fireEvent.click(
        screen.getAllByTestId("confirmation-dialog-confirm-button")[1],
      );
    });

    expect(Composition.contestWriter.forceEnd).toHaveBeenCalledWith(contest.id);
    expect(useToast().error).toHaveBeenCalled();
  });

  it("disables force button when contest has ended", async () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    (useContestStatusWatcher as jest.Mock).mockReturnValue(ContestStatus.ENDED);

    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    await renderWithProviders(
      <SettingsPageContestTab
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
        form={form.current}
      />,
    );

    expect(screen.getByTestId("force-toggle-button")).toBeDisabled();
  });
});
