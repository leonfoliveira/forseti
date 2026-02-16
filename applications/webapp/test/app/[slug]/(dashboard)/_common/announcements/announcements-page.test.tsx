import { fireEvent, screen } from "@testing-library/dom";

import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("AnnouncementsPage", () => {
  const contestMetadata = MockContestMetadataResponseDTO();
  const announcements = [
    MockAnnouncementResponseDTO(),
    MockAnnouncementResponseDTO(),
  ];

  it("should render variant with no announcement", async () => {
    await renderWithProviders(<AnnouncementsPage announcements={[]} />, {
      contestMetadata,
    });

    expect(document.title).toBe("Forseti - Announcements");
    expect(screen.getByTestId("empty")).toBeInTheDocument();
    expect(screen.queryByTestId("announcement-card")).not.toBeInTheDocument();
  });

  it("should render variant with announcements", async () => {
    await renderWithProviders(
      <AnnouncementsPage announcements={announcements} />,
      { contestMetadata },
    );

    expect(document.title).toBe("Forseti - Announcements");
    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("announcement-card")).toHaveLength(2);
  });

  it("should render variant with create", async () => {
    await renderWithProviders(
      <AnnouncementsPage
        announcements={announcements}
        canCreate
        onCreate={() => {}}
      />,
      { contestMetadata },
    );

    const createButton = screen.getByTestId("open-create-form-button");
    expect(createButton).toBeInTheDocument();
    fireEvent.click(createButton);

    expect(screen.getByTestId("announcement-form")).toBeInTheDocument();
  });
});
