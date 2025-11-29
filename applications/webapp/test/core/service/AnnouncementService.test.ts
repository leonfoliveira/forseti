import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AnnouncementRepository } from "@/core/port/driven/repository/AnnouncementRepository";
import { AnnouncementService } from "@/core/service/AnnouncementService";
import { MockCreateAnnouncementRequestDTO } from "@/test/mock/request/MockCreateAnnouncementRequestDTO";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";

describe("AnnouncementService", () => {
  const announcementRepository = mock<AnnouncementRepository>();

  const sut = new AnnouncementService(announcementRepository);

  const contestId = uuidv4();

  describe("createAnnouncement", () => {
    it("should call announcementRepository.create with the correct parameters", async () => {
      const inputDTO = MockCreateAnnouncementRequestDTO();
      const expectedResult = MockAnnouncementResponseDTO();
      announcementRepository.createAnnouncement.mockResolvedValue(
        expectedResult,
      );
      const result = await sut.createAnnouncement(contestId, inputDTO);
      expect(result).toEqual(expectedResult);
    });
  });
});
