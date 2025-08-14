import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";

import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AxiosSubmissionRepository } from "@/adapter/axios/AxiosSubmissionRepository";
import { UpdateSubmissionAnswerRequestDTO } from "@/core/repository/dto/request/UpdateSubmissionAnswerRequestDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";

describe("AxiosSubmissionRepository", () => {
  const axiosClient = mock<AxiosClient>();
  const sut = new AxiosSubmissionRepository(axiosClient);

  describe("createSubmission", () => {
    it("should create a submission and return the full response", async () => {
      const request = { language: "java" } as any;
      const expectedResponse = {
        id: "submission123",
      } as SubmissionFullResponseDTO;
      axiosClient.post.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.createSubmission(request);

      expect(axiosClient.post).toHaveBeenCalledWith("/v1/submissions", {
        data: request,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findAllFullForMember", () => {
    it("should return an array of full submissions for the member", async () => {
      const expectedResponse = [
        { id: "submission123" },
      ] as SubmissionFullResponseDTO[];
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findAllFullForMember();

      expect(axiosClient.get).toHaveBeenCalledWith("/v1/submissions/full/me");
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("updateSubmissionAnswer", () => {
    it("should update the submission answer", async () => {
      const id = "submission123";
      const data = { answer: "ACCEPTED" } as UpdateSubmissionAnswerRequestDTO;

      await sut.updateSubmissionAnswer(id, data);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/submissions/${id}/answer/${data.answer}/force`,
      );
    });
  });

  describe("rerunSubmission", () => {
    it("should rerun the submission", async () => {
      const id = "submission123";

      await sut.rerunSubmission(id);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/submissions/${id}/rerun`,
      );
    });
  });
});
