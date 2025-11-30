import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AnnouncementService } from "@/core/application/service/AnnouncementService";
import { AnnouncementRepository } from "@/core/port/driven/repository/AnnouncementRepository";
import { MockCreateAnnouncementRequestDTO } from "@/test/mock/request/MockCreateAnnouncementRequestDTO";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";

describe("AnnouncementService", () => {
  const announcementRepository = mock<AnnouncementRepository>();

  const sut = new AnnouncementService(announcementRepository);

  const contestId = uuidv4();

  describe("create", () => {
    it("should call announcementRepository.create with the correct parameters", async () => {
      const inputDTO = MockCreateAnnouncementRequestDTO();
      const expectedResult = MockAnnouncementResponseDTO();
      announcementRepository.create.mockResolvedValue(expectedResult);
      const result = await sut.create(contestId, inputDTO);
      expect(result).toEqual(expectedResult);
    });
  });
});
