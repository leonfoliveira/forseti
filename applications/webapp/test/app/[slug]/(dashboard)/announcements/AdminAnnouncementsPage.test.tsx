import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPage";
import { AdminAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/AdminAnnouncementsPage";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPage",
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
