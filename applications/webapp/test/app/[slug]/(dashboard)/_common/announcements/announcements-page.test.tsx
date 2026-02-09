import { fireEvent, screen } from "@testing-library/dom";
import { v4 as uuidv4 } from "uuid";

import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("AnnouncementsPage", () => {
  const contestId = uuidv4();
  const announcements = [
    MockAnnouncementResponseDTO(),
    MockAnnouncementResponseDTO(),
  ];

  it("should render variant with no announcement", async () => {
    await renderWithProviders(
      <AnnouncementsPage contestId={contestId} announcements={[]} />,
    );

    expect(document.title).toBe("Forseti - Announcements");
    expect(screen.getByTestId("empty")).toBeInTheDocument();
    expect(screen.queryByTestId("announcement-card")).not.toBeInTheDocument();
  });

  it("should render variant with announcements", async () => {
    await renderWithProviders(
      <AnnouncementsPage contestId={contestId} announcements={announcements} />,
    );

    expect(document.title).toBe("Forseti - Announcements");
    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("announcement-card")).toHaveLength(2);
  });

  it("should render variant with create", async () => {
    await renderWithProviders(
      <AnnouncementsPage
        contestId={contestId}
        announcements={announcements}
        canCreate
      />,
    );

    const createButton = screen.getByTestId("open-create-form-button");
    expect(createButton).toBeInTheDocument();
    fireEvent.click(createButton);

    expect(screen.getByTestId("announcement-form")).toBeInTheDocument();
  });
});
