import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page";
import { JudgeAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/judge-announcements-page";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/announcements/announcements-page",
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
        contest: { announcements },
      },
    } as any);

    expect(AnnouncementsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        announcements,
        canCreate: true,
      }),
      undefined,
    );
  });
});
