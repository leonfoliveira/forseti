import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPage";
import { JudgeAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/JudgeAnnouncementsPage";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPage",
  () => ({
    AnnouncementsPage: jest.fn(),
  }),
);

describe("JudgeAnnouncementsPage", () => {
  it("should render common AnnouncementsPage with correct data", async () => {
    const announcements = [
      MockAnnouncementResponseDTO(),
      MockAnnouncementResponseDTO(),
    ];
    await renderWithProviders(<JudgeAnnouncementsPage />, {
      judgeDashboard: {
        announcements,
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
