import { render } from "@testing-library/react";

import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";
import ContestantAnnouncementsPage from "@/app/contests/[slug]/contestant/announcements/page";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import {
  mockUseContestantDashboard,
  mockUseContestMetadata,
} from "@/test/jest.setup";

jest.mock("@/store/slices/contest-metadata-slice");
jest.mock("@/app/contests/[slug]/_common/announcements-page");

describe("ContestantAnnouncementsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    } as ContestMetadataResponseDTO;
    mockUseContestMetadata.mockReturnValueOnce(contest);
    const announcements = [
      {
        id: "announcement-id",
      },
    ] as AnnouncementResponseDTO[];
    mockUseContestantDashboard.mockReturnValueOnce(announcements);

    render(<ContestantAnnouncementsPage />);

    expect(AnnouncementsPage as jest.Mock).toHaveBeenCalledWith(
      { contestId: contest.id, announcements },
      undefined,
    );
  });
});
