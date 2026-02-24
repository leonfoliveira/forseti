import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page";
import { AdminAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/admin-announcements-page";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/announcements/announcements-page",
  () => ({
    AnnouncementsPage: jest.fn(),
  }),
);

describe("AdminAnnouncementsPage", () => {
  it("should render common AnnouncementsPage with correct data", async () => {
    const announcements = [
      MockAnnouncementResponseDTO(),
      MockAnnouncementResponseDTO(),
    ];
    await renderWithProviders(<AdminAnnouncementsPage />, {
      adminDashboard: {
        announcements,
      },
    } as any);

    expect(AnnouncementsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        announcements,
        canCreate: true,
        onCreate: expect.any(Function),
      }),
      undefined,
    );
  });
});
