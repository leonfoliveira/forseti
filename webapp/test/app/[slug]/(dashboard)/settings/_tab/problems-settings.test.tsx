import { fireEvent, renderHook, screen } from "@testing-library/react";
import { useForm, UseFormReturn } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import { SettingsForm } from "@/app/[slug]/(dashboard)/settings/_form/settings-form";
import { ProblemsSettings } from "@/app/[slug]/(dashboard)/settings/_tab/problems-settings";
import { attachmentService } from "@/config/composition";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ProblemsSettings", () => {
  const { result: form } = renderHook(
    () => useForm() as UseFormReturn<SettingsForm>,
  );
  const contestMetadata = MockContestMetadataResponseDTO();

  it("should not render when not open", async () => {
    await renderWithProviders(
      <ProblemsSettings form={form.current} isOpen={false} />,
      { contestMetadata },
    );

    expect(screen.queryByTestId("problems-settings")).toHaveClass("hidden");
  });

  it("should render empty state correctly", async () => {
    await renderWithProviders(
      <ProblemsSettings form={form.current} isOpen={true} />,
      { contestMetadata },
    );

    expect(screen.queryByTestId("problem")).not.toBeInTheDocument();
    expect(screen.getByTestId("empty")).toBeInTheDocument();
    expect(screen.getByTestId("add-first-problem")).toBeEnabled();
  });

  it("should handle problem addition and removal", async () => {
    await renderWithProviders(
      <ProblemsSettings form={form.current} isOpen={true} />,
      { contestMetadata },
    );

    fireEvent.click(screen.getByTestId("add-first-problem"));
    expect(screen.getByTestId("problem")).toBeInTheDocument();
    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();
    expect(screen.getByTestId("problem-index")).toHaveTextContent("A");
    expect(screen.queryByTestId("description-alert")).not.toBeInTheDocument();
    expect(screen.queryByTestId("test-cases-alert")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("add-problem"));
    const problems = screen.getAllByTestId("problem");
    expect(problems).toHaveLength(2);

    fireEvent.click(screen.getAllByTestId("remove-problem")[0]);
    expect(screen.getByTestId("problem")).toBeInTheDocument();
    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("remove-problem"));
    expect(screen.queryByTestId("problem")).not.toBeInTheDocument();
    expect(screen.getByTestId("empty")).toBeInTheDocument();
  });

  it("should show alerts when there is previous attachments", async () => {
    form.current.setValue("problems", [
      {
        id: uuidv4(),
        title: "Sample Problem",
        description: { id: uuidv4() },
        timeLimit: "1000",
        memoryLimit: "1024",
        testCases: { id: uuidv4() },
      },
    ] as any);
    await renderWithProviders(
      <ProblemsSettings form={form.current} isOpen={true} />,
      { contestMetadata },
    );

    expect(screen.queryByTestId("description-alert")).toBeInTheDocument();
    expect(screen.queryByTestId("test-cases-alert")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("download-description"));
    fireEvent.click(screen.getByTestId("download-test-cases"));

    expect(attachmentService.download).toHaveBeenCalledTimes(2);
    expect(attachmentService.download).toHaveBeenCalledWith(
      contestMetadata.id,
      form.current.getValues("problems")[0].description,
    );
    expect(attachmentService.download).toHaveBeenCalledWith(
      contestMetadata.id,
      form.current.getValues("problems")[0].testCases,
    );
  });
});
