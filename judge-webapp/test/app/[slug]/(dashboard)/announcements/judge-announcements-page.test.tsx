import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements-page";
import { JudgeAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/judge-announcements-page";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/announcements-page", () => ({
  AnnouncementsPage: jest.fn(),
}));

describe("JudgeAnnouncementsPage", () => {
  it("should render common AnnouncementsPage with correct data", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const announcements = [
      MockAnnouncementResponseDTO(),
      MockAnnouncementResponseDTO(),
    ];
    await renderWithProviders(<JudgeAnnouncementsPage />, {
      contestMetadata,
      judgeDashboard: {
        data: { contest: { announcements } },
      },
    } as any);

    expect(AnnouncementsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        contestId: contestMetadata.id,
        announcements,
        canCreate: true,
      }),
      undefined,
    );
  });
});
