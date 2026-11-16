import { fireEvent, screen } from "@testing-library/dom";

import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPage";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPageCard",
  () => ({
    AnnouncementsPageCard: () => <div data-testid="announcement-card" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPageForm",
  () => ({
    AnnouncementsPageForm: () => <div data-testid="create-form" />,
  }),
);

describe("AnnouncementsPage", () => {
  it("renders empty state", async () => {
    await renderWithProviders(<AnnouncementsPage announcements={[]} />);

    expect(screen.queryByTestId("announcement-card")).not.toBeInTheDocument();
    expect(screen.getByTestId("empty")).toBeInTheDocument();
    expect(
      screen.queryByTestId("open-create-form-button"),
    ).not.toBeInTheDocument();
  });

  it("renders announcement details", async () => {
    const announcements = [MockAnnouncementResponseDTO()];
    await renderWithProviders(
      <AnnouncementsPage announcements={announcements} />,
    );

    expect(screen.getByTestId("announcement-card")).toBeInTheDocument();
    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("open-create-form-button"),
    ).not.toBeInTheDocument();
  });

  it("renders create form", async () => {
    const onCreate = jest.fn();

    await renderWithProviders(
      <AnnouncementsPage announcements={[]} canCreate onCreate={onCreate} />,
    );

    expect(screen.getByTestId("open-create-form-button")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("open-create-form-button"));
    expect(screen.getByTestId("create-form")).toBeInTheDocument();
  });
});
