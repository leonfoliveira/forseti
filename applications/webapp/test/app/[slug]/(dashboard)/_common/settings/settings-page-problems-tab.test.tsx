import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { SettingsPageProblemsTab } from "@/app/[slug]/(dashboard)/_common/settings/settings-page-problems-tab";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { attachmentReader } from "@/config/composition";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachment";
import { MockContestFullResponseDTO } from "@/test/mock/response/contest/MockContestFullResponseDTO";
import {
  renderHookWithProviders,
  renderWithProviders,
} from "@/test/render-with-providers";

describe("SettingsPageProblemsTab", () => {
  const contest = MockContestFullResponseDTO();

  it("renders problem fields correctly", async () => {
    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>(),
    );

    await renderWithProviders(
      <SettingsPageProblemsTab contest={contest} form={result.current} />,
    );

    const descriptionFile = new File(["description"], "description.pdf", {
      type: "application/pdf",
    });
    const testCasesFile = new File(["input,output"], "testcases.csv", {
      type: "text/csv",
    });

    fireEvent.click(screen.getByTestId("add-problem-button"));
    fireEvent.change(screen.getByTestId("problem-title"), {
      target: { value: "Sample Problem 1" },
    });
    fireEvent.change(screen.getByTestId("problem-time-limit"), {
      target: { value: "2000" },
    });
    fireEvent.change(screen.getByTestId("problem-memory-limit"), {
      target: { value: "2048" },
    });
    fireEvent.change(screen.getByTestId("problem-description"), {
      target: { files: [descriptionFile] },
    });
    fireEvent.change(screen.getByTestId("problem-test-cases"), {
      target: { files: [testCasesFile] },
    });
    expect(
      screen.queryByTestId("problem-description-download"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("problem-test-cases-download"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("add-problem-button"));
    expect(screen.getAllByTestId("problem-title")[0]).toHaveValue(
      "Sample Problem 1",
    );
    fireEvent.click(screen.getAllByTestId("move-problem-down-button")[0]);
    expect(screen.getAllByTestId("problem-title")[1]).toHaveValue(
      "Sample Problem 1",
    );
    fireEvent.click(screen.getAllByTestId("move-problem-up-button")[1]);
    expect(screen.getAllByTestId("problem-title")[0]).toHaveValue(
      "Sample Problem 1",
    );

    expect(result.current.getValues("problems").length).toBe(2);
    fireEvent.click(screen.getAllByTestId("remove-problem-button")[1]);
    expect(screen.queryByTestId("problem-title")).toHaveValue(
      "Sample Problem 1",
    );
    expect(result.current.getValues("problems").length).toBe(1);
  });

  it("render download buttons when description and test cases exist", async () => {
    const descriptionAttachment = MockAttachmentResponseDTO();
    const testCasesAttachment = MockAttachmentResponseDTO();

    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>({
        defaultValues: {
          problems: [
            {
              color: "#ffffff",
              description: descriptionAttachment,
              testCases: testCasesAttachment,
            },
          ],
        },
      }),
    );

    await renderWithProviders(
      <SettingsPageProblemsTab contest={contest} form={result.current} />,
    );

    fireEvent.click(screen.getByTestId("problem-description-download"));
    expect(attachmentReader.download).toHaveBeenCalledWith(
      contest.id,
      descriptionAttachment,
    );

    fireEvent.click(screen.getByTestId("problem-test-cases-download"));
    expect(attachmentReader.download).toHaveBeenCalledWith(
      contest.id,
      testCasesAttachment,
    );
  });

  it("handles download errors gracefully", async () => {
    const descriptionAttachment = MockAttachmentResponseDTO();
    (attachmentReader.download as jest.Mock).mockRejectedValueOnce(
      new Error("Download failed"),
    );

    const { result } = await renderHookWithProviders(() =>
      useForm<SettingsFormType>({
        defaultValues: {
          problems: [
            {
              color: "#ffffff",
              description: descriptionAttachment,
            },
          ],
        },
      }),
    );

    await renderWithProviders(
      <SettingsPageProblemsTab contest={contest} form={result.current} />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("problem-description-download"));
    });

    expect(attachmentReader.download).toHaveBeenCalledWith(
      contest.id,
      descriptionAttachment,
    );
    expect(useToast().error).toHaveBeenCalled();
  });
});
