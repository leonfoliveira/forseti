
import { fireEvent, screen } from "@testing-library/dom";
import { act } from "react";
import { v4 as uuidv4 } from "uuid";

import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements-page";
import { announcementService } from "@/config/composition";
import { useToast } from "@/lib/util/toast-hook";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("AnnouncementsPage", () => {
  const contestId = uuidv4();
  const announcements = [
    MockAnnouncementResponseDTO(),
    MockAnnouncementResponseDTO(),
  ];

  it("should render variant with no announcement", async () => {
    await renderWithProviders(
      <AnnouncementsPage contestId={contestId} announcements={[]} />,
    );

    expect(document.title).toBe("Judge - Announcements");
    expect(screen.getByTestId("empty")).toBeInTheDocument();
    expect(screen.queryByTestId("announcement")).not.toBeInTheDocument();
  });

  it("should render variant with announcements", async () => {
    await renderWithProviders(
      <AnnouncementsPage contestId={contestId} announcements={announcements} />,
    );

    expect(document.title).toBe("Judge - Announcements");
    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("announcement")).toHaveLength(2);
    expect(
      screen.getAllByTestId("announcement-member-name")[0],
    ).toHaveTextContent(announcements[0].member.name);
    expect(
      screen.getAllByTestId("announcement-created-at")[0],
    ).toHaveTextContent("01/01/2025, 10:00:00 AM");
    expect(screen.getAllByTestId("announcement-text")[0]).toHaveTextContent(
      announcements[0].text,
    );
  });

  it("should render variant with create", async () => {
    await renderWithProviders(
      <AnnouncementsPage
        contestId={contestId}
        announcements={announcements}
        canCreate
      />,
    );

    expect(screen.getByTestId("announcement-form")).toBeInTheDocument();
    expect(screen.getByTestId("announcement-form-title")).toHaveTextContent(
      "Create Announcement",
    );
    expect(screen.getByTestId("announcement-form-text")).toBeEnabled();
    expect(screen.getByTestId("announcement-form-submit")).toBeEnabled();
  });

  it("should handle announcement creation success", async () => {
    await renderWithProviders(
      <AnnouncementsPage
        contestId={contestId}
        announcements={announcements}
        canCreate
      />,
    );

    fireEvent.change(screen.getByTestId("announcement-form-text"), {
      target: { value: "New announcement" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("announcement-form-submit"));
    });

    expect(
      announcementService.createAnnouncement as jest.Mock,
    ).toHaveBeenCalledWith(contestId, { text: "New announcement" });
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle announcement creation error", async () => {
    announcementService.createAnnouncement = jest
      .fn()
      .mockRejectedValueOnce(new Error("Failed to create announcement"));

    await renderWithProviders(
      <AnnouncementsPage
        contestId={contestId}
        announcements={announcements}
        canCreate
      />,
    );

    fireEvent.change(screen.getByTestId("announcement-form-text"), {
      target: { value: "New announcement" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("announcement-form-submit"));
    });

    expect(
      announcementService.createAnnouncement as jest.Mock,
    ).toHaveBeenCalledWith(contestId, { text: "New announcement" });
    expect(useToast().error).toHaveBeenCalled();
  });
});
