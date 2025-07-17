import { mock } from "jest-mock-extended";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AxiosProblemRepository } from "@/adapter/axios/AxiosProblemRepository";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { AxiosResponse } from "axios";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";

describe("AxiosProblemRepository", () => {
  const axiosClient = mock<AxiosClient>();
  const sut = new AxiosProblemRepository(axiosClient);

  describe("createSubmission", () => {
    it("should create a submission for a problem and return the full response", async () => {
      const id = "problem123";
      const request = {
        language: "java",
      } as unknown as CreateSubmissionRequestDTO;
      const expectedResponse = {
        id: "submission123",
      } as SubmissionFullResponseDTO;
      axiosClient.post.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.createSubmission(id, request);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/problems/{id}/submissions`,
        { data: request },
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
