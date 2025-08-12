import { act, fireEvent, render, screen } from "@testing-library/react";

import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";
import { contestService } from "@/config/composition";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { mockAlert } from "@/test/jest.setup";

jest.mock("@/config/composition");

describe("AnnouncementsPage", () => {
  it("should render empty when there are no announcements", () => {
    render(<AnnouncementsPage contestId="1" announcements={[]} />);

    expect(screen.queryByTestId("create-form")).not.toBeInTheDocument();
    expect(screen.getByTestId("empty")).toBeInTheDocument();
  });

  it("should render announcements when provided", () => {
    const announcements = [
      {
        id: "1",
        member: { name: "member" },
        text: "Announcement 1",
        createdAt: new Date().toISOString(),
      },
    ] as AnnouncementResponseDTO[];

    render(<AnnouncementsPage contestId="1" announcements={announcements} />);

    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();
    expect(screen.getByTestId("announcement-member")).toHaveTextContent(
      announcements[0].member.name,
    );
    expect(screen.getByTestId("announcement-timestamp")).toHaveTextContent(
      announcements[0].createdAt,
    );
    expect(screen.getByTestId("announcement-text")).toHaveTextContent(
      announcements[0].text,
    );
  });

  it("should alert error on create failure", async () => {
    (contestService.createAnnouncement as jest.Mock).mockRejectedValueOnce(
      new Error("Create error"),
    );

    render(<AnnouncementsPage contestId="1" announcements={[]} canCreate />);

    expect(screen.getByTestId("create-form")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("form-text"), {
      target: { value: "New Announcement" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("form-submit"));
    });
    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "Failed to create announcement",
      id: "app.contests.[slug]._common.announcements-page.create-error",
    });
  });

  it("should alert success on create success", async () => {
    (contestService.createAnnouncement as jest.Mock).mockResolvedValueOnce({});

    render(<AnnouncementsPage contestId="1" announcements={[]} canCreate />);

    expect(screen.getByTestId("create-form")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("form-text"), {
      target: { value: "New Announcement" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("form-submit"));
    });
    expect(mockAlert.success).toHaveBeenCalledWith({
      defaultMessage: "Announcement created successfully",
      id: "app.contests.[slug]._common.announcements-page.create-success",
    });
  });
});
