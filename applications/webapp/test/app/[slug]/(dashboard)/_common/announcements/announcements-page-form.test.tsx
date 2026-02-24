import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { AnnouncementsPageForm } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page-form";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { Composition } from "@/config/composition";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("AnnouncementsPageForm", () => {
  it("should render form fields and submit button", async () => {
    const onCreate = jest.fn();
    const onClose = jest.fn();
    await renderWithProviders(
      <AnnouncementsPageForm
        contestId="test-contest"
        onClose={onClose}
        onCreate={onCreate}
      />,
    );

    expect(screen.getByTestId("announcement-form")).toBeInTheDocument();
    expect(screen.getByTestId("announcement-form-text")).toBeInTheDocument();
    expect(screen.getByTestId("announcement-form-cancel")).toBeInTheDocument();
    expect(screen.getByTestId("announcement-form-submit")).toBeInTheDocument();
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = jest.fn();
    const onCreate = jest.fn();
    await renderWithProviders(
      <AnnouncementsPageForm
        contestId="test-contest"
        onClose={onClose}
        onCreate={onCreate}
      />,
    );

    screen.getByTestId("announcement-form-cancel").click();
    expect(onClose).toHaveBeenCalled();
  });

  it("should create announcement when submit button is clicked", async () => {
    const newAnnouncement = MockAnnouncementResponseDTO();
    (Composition.announcementWritter.create as jest.Mock).mockResolvedValueOnce(
      newAnnouncement,
    );

    const onClose = jest.fn();
    const onCreate = jest.fn();
    await renderWithProviders(
      <AnnouncementsPageForm
        contestId="test-contest"
        onClose={onClose}
        onCreate={onCreate}
      />,
    );

    fireEvent.change(screen.getByTestId("announcement-form-text"), {
      target: { value: "Test announcement" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("announcement-form-submit"));
    });

    expect(Composition.announcementWritter.create).toHaveBeenCalledWith(
      "test-contest",
      {
        text: "Test announcement",
      },
    );
    expect(useToast().success).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(onCreate).toHaveBeenCalledWith(newAnnouncement);
  });

  it("should show error toast when announcement creation fails", async () => {
    (Composition.announcementWritter.create as jest.Mock).mockRejectedValueOnce(
      new Error("Creation failed"),
    );

    const onClose = jest.fn();
    const onCreate = jest.fn();
    await renderWithProviders(
      <AnnouncementsPageForm
        contestId="test-contest"
        onClose={onClose}
        onCreate={onCreate}
      />,
    );

    fireEvent.change(screen.getByTestId("announcement-form-text"), {
      target: { value: "Test announcement" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("announcement-form-submit"));
    });

    expect(Composition.announcementWritter.create).toHaveBeenCalledWith(
      "test-contest",
      {
        text: "Test announcement",
      },
    );
    expect(useToast().error).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
