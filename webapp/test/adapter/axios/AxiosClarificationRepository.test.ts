
import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AxiosClarificationRepository } from "@/adapter/axios/AxiosClarificationRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { MockCreateClarificationRequestDTO } from "@/test/mock/request/MockCreateClarificationRequestDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";

describe("AxiosClarificationRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosClarificationRepository(axiosClient);

  const contestId = uuidv4();

  describe("createClarification", () => {
    it("should create a clarification", async () => {
      const requestDTO = MockCreateClarificationRequestDTO();
      const expectedResponse = MockClarificationResponseDTO();
      axiosClient.post.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.createClarification(contestId, requestDTO);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/clarifications`,
        {
          data: requestDTO,
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("deleteById", () => {
    it("should delete a clarification by id", async () => {
      const clarificationId = uuidv4();

      await sut.deleteById(contestId, clarificationId);

      expect(axiosClient.delete).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/clarifications/${clarificationId}`,
      );
    });
  });
});
