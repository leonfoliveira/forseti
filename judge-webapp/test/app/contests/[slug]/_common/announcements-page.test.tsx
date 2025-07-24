import { act, fireEvent, render, screen } from "@testing-library/react";
import AnnouncementsPage from "@/app/contests/[slug]/_common/announcements-page";
import { mockAlert } from "@/test/jest.setup";
import { contestService } from "@/config/composition";

jest.mock("@/config/composition");
jest.mock("@/app/_component/timestamp-display", () => ({
  TimestampDisplay: ({ timestamp }: any) => timestamp,
}));

describe("AnnouncementsPage", () => {
  it("should render empty when there are no announcements", () => {
    render(<AnnouncementsPage contest={{ announcements: [] } as any} />);

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
    ];

    render(<AnnouncementsPage contest={{ announcements } as any} />);

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

    render(
      <AnnouncementsPage contest={{ announcements: [] } as any} canCreate />,
    );

    expect(screen.getByTestId("create-form")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("form-text"), {
      target: { value: "New Announcement" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("form-submit"));
    });
    expect(mockAlert.error).toHaveBeenCalledWith("create-error");
  });

  it("should alert success on create success", async () => {
    (contestService.createAnnouncement as jest.Mock).mockResolvedValueOnce({});

    render(
      <AnnouncementsPage contest={{ announcements: [] } as any} canCreate />,
    );

    expect(screen.getByTestId("create-form")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("form-text"), {
      target: { value: "New Announcement" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("form-submit"));
    });
    expect(mockAlert.success).toHaveBeenCalledWith("create-success");
  });
});
