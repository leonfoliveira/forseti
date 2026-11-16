import { act, fireEvent, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import {
  SettingsForm,
  SettingsFormType,
} from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
import { SettingsPageProblemsTab } from "@/app/[slug]/(dashboard)/_common/settings/SettingsPageProblemsTab";
import {
  MockContestWithMembersAndProblemsDTO,
  MockProblemWithTestCasesResponseDTO,
} from "@/test/mock/response/MockDTOs";
import {
  renderWithProviders,
  renderHookWithProviders,
} from "@/test/render-with-providers";
import { Composition } from "@/config/composition";
import { useToast } from "@/app/_lib/hook/useToast";

describe("SettingsPageProblemsTab", () => {
  it("fills the form with problems", async () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );
    await renderWithProviders(
      <SettingsPageProblemsTab contest={contest} form={form.current} />,
    );

    fireEvent.click(screen.getByTestId("add-problem-button"));

    fireEvent.change(screen.getByTestId("problem-title"), {
      target: { value: "New Problem" },
    });
    fireEvent.change(screen.getByTestId("problem-time-limit"), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByTestId("problem-memory-limit"), {
      target: { value: "1024" },
    });
    fireEvent.change(screen.getByTestId("problem-description"), {
      target: {
        files: [new File([""], "description.pdf", { type: "application/pdf" })],
      },
    });
    fireEvent.change(screen.getByTestId("problem-test-cases"), {
      target: {
        files: [new File(["1,2"], "test-cases.csv", { type: "text/csv" })],
      },
    });

    expect(form.current.getValues("problems")).toEqual([
      {
        color: expect.any(String),
        title: "New Problem",
        timeLimitMs: "1000",
        memoryLimitMb: "1024",
        newDescription: [expect.any(File)],
        newTestCases: [expect.any(File)],
      },
    ]);

    fireEvent.click(screen.getByTestId("remove-problem-button"));
    expect(form.current.getValues("problems")).toEqual([]);
  });

  it("moves problem up and down", async () => {
    const contest = MockContestWithMembersAndProblemsDTO({
      problems: [
        MockProblemWithTestCasesResponseDTO(),
        MockProblemWithTestCasesResponseDTO(),
      ],
    });
    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>({
        defaultValues: SettingsForm.fromResponseDTO(contest),
      }),
    );

    await renderWithProviders(
      <SettingsPageProblemsTab contest={contest} form={form.current} />,
    );

    expect(form.current.getValues("problems")[0]._id).toBe(
      SettingsForm.fromResponseDTO(contest).problems[0]._id,
    );
    expect(form.current.getValues("problems")[1]._id).toBe(
      SettingsForm.fromResponseDTO(contest).problems[1]._id,
    );

    fireEvent.click(screen.getAllByTestId("move-problem-down-button")[0]);

    expect(form.current.getValues("problems")[0]._id).toBe(
      SettingsForm.fromResponseDTO(contest).problems[1]._id,
    );
    expect(form.current.getValues("problems")[1]._id).toBe(
      SettingsForm.fromResponseDTO(contest).problems[0]._id,
    );

    fireEvent.click(screen.getAllByTestId("move-problem-up-button")[1]);

    expect(form.current.getValues("problems")[0]._id).toBe(
      SettingsForm.fromResponseDTO(contest).problems[0]._id,
    );
    expect(form.current.getValues("problems")[1]._id).toBe(
      SettingsForm.fromResponseDTO(contest).problems[1]._id,
    );
  });

  it("downloads description file", async () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>({
        defaultValues: SettingsForm.fromResponseDTO(contest),
      }),
    );

    await renderWithProviders(
      <SettingsPageProblemsTab contest={contest} form={form.current} />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("problem-description-download"));
    });

    expect(Composition.attachmentReader.download).toHaveBeenCalledWith(
      contest.id,
      contest.problems[0].description,
    );
  });

  it("show toast on description download error", async () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    (Composition.attachmentReader.download as jest.Mock).mockRejectedValueOnce(
      new Error("Download failed"),
    );
    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>({
        defaultValues: SettingsForm.fromResponseDTO(contest),
      }),
    );

    await renderWithProviders(
      <SettingsPageProblemsTab contest={contest} form={form.current} />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("problem-description-download"));
    });

    expect(useToast().error).toHaveBeenCalled();
  });

  it("downloads test cases file", async () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>({
        defaultValues: SettingsForm.fromResponseDTO(contest),
      }),
    );

    await renderWithProviders(
      <SettingsPageProblemsTab contest={contest} form={form.current} />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("problem-test-cases-download"));
    });

    expect(Composition.attachmentReader.download).toHaveBeenCalledWith(
      contest.id,
      contest.problems[0].testCases,
    );
  });

  it("show toast on test cases download error", async () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    (Composition.attachmentReader.download as jest.Mock).mockRejectedValueOnce(
      new Error("Download failed"),
    );
    const { result: form } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>({
        defaultValues: SettingsForm.fromResponseDTO(contest),
      }),
    );

    await renderWithProviders(
      <SettingsPageProblemsTab contest={contest} form={form.current} />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("problem-test-cases-download"));
    });

    expect(useToast().error).toHaveBeenCalled();
  });
});
