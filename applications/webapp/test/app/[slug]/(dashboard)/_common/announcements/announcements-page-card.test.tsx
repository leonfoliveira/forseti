import { screen } from "@testing-library/dom";

import { AnnouncementsPageCard } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page-card";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("AnnouncementsPageCard", () => {
  it("should render announcement details", async () => {
    const announcement = MockAnnouncementResponseDTO();
    await renderWithProviders(
      <AnnouncementsPageCard announcement={announcement} />,
    );

    expect(screen.getByTestId("announcement-member-name")).toHaveTextContent(
      announcement.member.name,
    );
    expect(screen.getByTestId("announcement-created-at")).toHaveTextContent(
      "01/01/2025, 10:00:00 AM",
    );
    expect(screen.getByTestId("announcement-text")).toHaveTextContent(
      announcement.text,
    );
  });
});
