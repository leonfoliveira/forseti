import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements-page";
import { GuestAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/guest-announcements-page";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/announcements-page", () => ({
  AnnouncementsPage: jest.fn(),
}));

describe("GuestAnnouncementsPage", () => {
  it("should render common AnnouncementsPage with correct data", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const announcements = [
      MockAnnouncementResponseDTO(),
      MockAnnouncementResponseDTO(),
    ];
    await renderWithProviders(<GuestAnnouncementsPage />, {
      contestMetadata,
      guestDashboard: {
        contest: { announcements },
      },
    } as any);

    expect(AnnouncementsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        contestId: contestMetadata.id,
        announcements,
      }),
      undefined,
    );
  });
});
