import { randomUUID } from "crypto";

import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";

import { AxiosAnnouncementRepository } from "@/adapter/axios/AxiosAnnouncementRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { MockCreateAnnouncementRequestDTO } from "@/test/mock/request/MockCreateAnnouncementRequestDTO";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";

describe("AxiosAnnouncementRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosAnnouncementRepository(axiosClient);

  const contestId = randomUUID();

  describe("createAnnouncement", () => {
    it("should create an announcement", async () => {
      const requestDTO = MockCreateAnnouncementRequestDTO();
      const expectedResponse = MockAnnouncementResponseDTO();
      axiosClient.post.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.createAnnouncement(contestId, requestDTO);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/announcements`,
        {
          data: requestDTO,
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
