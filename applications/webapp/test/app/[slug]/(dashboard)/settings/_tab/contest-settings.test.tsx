import { fireEvent, screen } from "@testing-library/dom";
import { act, renderHook } from "@testing-library/react";
import { useForm, UseFormReturn } from "react-hook-form";

import { SettingsForm } from "@/app/[slug]/(dashboard)/settings/_form/settings-form";
import { ContestSettings } from "@/app/[slug]/(dashboard)/settings/_tab/contest-settings";
import { useToast } from "@/app/_lib/util/toast-hook";
import { contestWritter } from "@/config/composition";
import { MockContestFullResponseDTO } from "@/test/mock/response/contest/MockContestFullResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ContestSettings", () => {
  const contest = MockContestFullResponseDTO();
  const { result: form } = renderHook(
    () => useForm() as UseFormReturn<SettingsForm>,
  );

  it("should not render when not open", async () => {
    await renderWithProviders(
      <ContestSettings contest={contest} form={form.current} isOpen={false} />,
      {
        contestMetadata: MockContestMetadataResponseDTO(),
      },
    );

    expect(screen.queryByTestId("contest-settings")).toHaveClass("hidden");
  });

  it("should render not started variant", async () => {
    await renderWithProviders(
      <ContestSettings contest={contest} form={form.current} isOpen={true} />,
      {
        contestMetadata: MockContestMetadataResponseDTO({
          startAt: new Date(Date.now() + 60 * 1000).toISOString(),
          endAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
        }),
      },
    );

    expect(screen.getByLabelText("Slug")).toBeEnabled();
    expect(screen.getByLabelText("Title")).toBeEnabled();
    expect(screen.getByText("Languages")).toBeInTheDocument();
    expect(screen.getByTestId("start-at-picker")).toBeEnabled();
    expect(screen.getByTestId("end-at-picker")).toBeEnabled();
    expect(screen.getByTestId("force-start")).toBeEnabled();
    expect(screen.getByTestId("force-end")).not.toBeEnabled();
    expect(screen.getByTestId("is-auto-judge-enabled")).toBeEnabled();
  });

  it("should render in progress variant", async () => {
    await renderWithProviders(
      <ContestSettings contest={contest} form={form.current} isOpen={true} />,
      {
        contestMetadata: MockContestMetadataResponseDTO({
          startAt: new Date(Date.now() - 60 * 1000).toISOString(),
          endAt: new Date(Date.now() + 60 * 1000).toISOString(),
        }),
      },
    );

    expect(screen.getByTestId("start-at-picker").ariaDisabled).toBe("true");
    expect(screen.getByTestId("force-start")).toBeDisabled();
    expect(screen.getByTestId("force-end")).toBeEnabled();
  });

  it("should render ended variant", async () => {
    await renderWithProviders(
      <ContestSettings contest={contest} form={form.current} isOpen={true} />,
      {
        contestMetadata: MockContestMetadataResponseDTO({
          startAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          endAt: new Date(Date.now() - 60 * 1000).toISOString(),
        }),
      },
    );

    expect(screen.getByTestId("force-start")).toBeDisabled();
    expect(screen.getByTestId("force-end")).toBeDisabled();
  });

  it("should handle force start success", async () => {
    const newContestMetadata = MockContestMetadataResponseDTO();
    (contestWritter.forceStart as jest.Mock).mockResolvedValue(
      newContestMetadata,
    );
    const { store } = await renderWithProviders(
      <ContestSettings contest={contest} form={form.current} isOpen={true} />,
      {
        contestMetadata: MockContestMetadataResponseDTO({
          startAt: new Date(Date.now() + 60 * 1000).toISOString(),
          endAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
        }),
        adminDashboard: { data: { contest } } as any,
      },
    );

    expect(screen.getByTestId("force-start")).toBeEnabled();
    await act(async () => {
      fireEvent.click(screen.getByTestId("force-start"));
    });
    const confirmModal = screen.getByTestId("confirm-force-start-modal");
    expect(confirmModal).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(confirmModal.getByTestId("confirm")!);
    });
    expect(contestWritter.forceStart).toHaveBeenCalledWith(contest.id);
    expect(store.getState().contestMetadata).toBe(newContestMetadata);
    expect(store.getState().adminDashboard.contest).toMatchObject(
      newContestMetadata,
    );
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle force start failure", async () => {
    (contestWritter.forceStart as jest.Mock).mockRejectedValue(new Error());
    await renderWithProviders(
      <ContestSettings contest={contest} form={form.current} isOpen={true} />,
      {
        contestMetadata: MockContestMetadataResponseDTO({
          startAt: new Date(Date.now() + 60 * 1000).toISOString(),
          endAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
        }),
        adminDashboard: { data: { contest } } as any,
      },
    );

    expect(screen.getByTestId("force-start")).toBeEnabled();
    await act(async () => {
      fireEvent.click(screen.getByTestId("force-start"));
    });
    const confirmModal = screen.getByTestId("confirm-force-start-modal");
    expect(confirmModal).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(confirmModal.getByTestId("confirm")!);
    });
    expect(contestWritter.forceStart).toHaveBeenCalledWith(contest.id);
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should handle force end success", async () => {
    const newContestMetadata = MockContestMetadataResponseDTO();
    (contestWritter.forceEnd as jest.Mock).mockResolvedValue(
      newContestMetadata,
    );
    const { store } = await renderWithProviders(
      <ContestSettings contest={contest} form={form.current} isOpen={true} />,
      {
        contestMetadata: MockContestMetadataResponseDTO({
          startAt: new Date(Date.now() - 60 * 1000).toISOString(),
          endAt: new Date(Date.now() + 60 * 1000).toISOString(),
        }),
        adminDashboard: { data: { contest } } as any,
      },
    );

    expect(screen.getByTestId("force-end")).toBeEnabled();
    await act(async () => {
      fireEvent.click(screen.getByTestId("force-end"));
    });
    const confirmModal = screen.getByTestId("confirm-force-end-modal");
    expect(confirmModal).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(confirmModal.getByTestId("confirm")!);
    });
    expect(contestWritter.forceEnd).toHaveBeenCalledWith(contest.id);
    expect(store.getState().contestMetadata).toBe(newContestMetadata);
    expect(store.getState().adminDashboard.contest).toMatchObject(
      newContestMetadata,
    );
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle force end failure", async () => {
    (contestWritter.forceEnd as jest.Mock).mockRejectedValue(new Error());
    await renderWithProviders(
      <ContestSettings contest={contest} form={form.current} isOpen={true} />,
      {
        contestMetadata: MockContestMetadataResponseDTO({
          startAt: new Date(Date.now() - 60 * 1000).toISOString(),
          endAt: new Date(Date.now() + 60 * 1000).toISOString(),
        }),
        adminDashboard: { data: { contest } } as any,
      },
    );

    expect(screen.getByTestId("force-end")).toBeEnabled();
    await act(async () => {
      fireEvent.click(screen.getByTestId("force-end"));
    });
    const confirmModal = screen.getByTestId("confirm-force-end-modal");
    expect(confirmModal).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(confirmModal.getByTestId("confirm")!);
    });
    expect(contestWritter.forceEnd).toHaveBeenCalledWith(contest.id);
    expect(useToast().error).toHaveBeenCalled();
  });
});
