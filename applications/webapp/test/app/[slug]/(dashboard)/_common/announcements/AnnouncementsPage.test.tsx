import { screen } from "@testing-library/dom";

import { AnnouncementsPageCard } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPageCard";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/MockDTOs";
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
    expect(
      screen.getByTestId("announcement-created-at"),
    ).not.toBeEmptyDOMElement();
    expect(screen.getByTestId("announcement-text")).toHaveTextContent(
      announcement.text,
    );
  });
});
