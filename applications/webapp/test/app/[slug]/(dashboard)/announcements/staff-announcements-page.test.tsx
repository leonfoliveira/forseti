import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page";
import { StaffAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/staff-announcements-page";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/announcements/announcements-page",
  () => ({
    AnnouncementsPage: jest.fn(),
  }),
);

describe("StaffAnnouncementsPage", () => {
  it("should render common AnnouncementsPage with correct data", async () => {
    const announcements = [
      MockAnnouncementResponseDTO(),
      MockAnnouncementResponseDTO(),
    ];
    await renderWithProviders(<StaffAnnouncementsPage />, {
      staffDashboard: {
        contest: { announcements },
      },
    } as any);

    expect(AnnouncementsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        announcements,
      }),
      undefined,
    );
  });
});
