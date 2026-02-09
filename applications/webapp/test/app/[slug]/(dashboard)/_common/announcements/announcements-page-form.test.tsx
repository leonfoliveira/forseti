import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { AnnouncementsPageForm } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page-form";
import { useToast } from "@/app/_lib/util/toast-hook";
import { announcementWritter } from "@/config/composition";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("AnnouncementsPageForm", () => {
  it("should render form fields and submit button", async () => {
    const onClose = jest.fn();
    await renderWithProviders(
      <AnnouncementsPageForm contestId="test-contest" onClose={onClose} />,
    );

    expect(screen.getByTestId("announcement-form")).toBeInTheDocument();
    expect(screen.getByTestId("announcement-form-text")).toBeInTheDocument();
    expect(screen.getByTestId("announcement-form-cancel")).toBeInTheDocument();
    expect(screen.getByTestId("announcement-form-submit")).toBeInTheDocument();
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = jest.fn();
    await renderWithProviders(
      <AnnouncementsPageForm contestId="test-contest" onClose={onClose} />,
    );

    screen.getByTestId("announcement-form-cancel").click();
    expect(onClose).toHaveBeenCalled();
  });

  it("should create announcement when submit button is clicked", async () => {
    (announcementWritter.create as jest.Mock).mockResolvedValueOnce(
      MockAnnouncementResponseDTO(),
    );

    const onClose = jest.fn();
    await renderWithProviders(
      <AnnouncementsPageForm contestId="test-contest" onClose={onClose} />,
    );

    fireEvent.change(screen.getByTestId("announcement-form-text"), {
      target: { value: "Test announcement" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("announcement-form-submit"));
    });

    expect(announcementWritter.create).toHaveBeenCalledWith("test-contest", {
      text: "Test announcement",
    });
    expect(useToast().success).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should show error toast when announcement creation fails", async () => {
    (announcementWritter.create as jest.Mock).mockRejectedValueOnce(
      new Error("Creation failed"),
    );

    const onClose = jest.fn();
    await renderWithProviders(
      <AnnouncementsPageForm contestId="test-contest" onClose={onClose} />,
    );

    fireEvent.change(screen.getByTestId("announcement-form-text"), {
      target: { value: "Test announcement" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("announcement-form-submit"));
    });

    expect(announcementWritter.create).toHaveBeenCalledWith("test-contest", {
      text: "Test announcement",
    });
    expect(useToast().error).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
