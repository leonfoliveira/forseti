import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";
import { AxiosSubmissionRepository } from "@/infrastructure/adapter/axios/repository/AxiosSubmissionRepository";
import { MockSubmissionWithCodeResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeResponseDTO";

describe("AxiosSubmissionRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosSubmissionRepository(axiosClient);

  const contestId = uuidv4();

  describe("create", () => {
    it("should create a submission and return the full response", async () => {
      const request = { language: "java" } as any;
      const expectedResponse = MockSubmissionWithCodeResponseDTO();
      axiosClient.post.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.create(contestId, request);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/submissions`,
        {
          data: request,
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("updateAnswer", () => {
    it("should update the submission answer", async () => {
      const submission = MockSubmissionWithCodeResponseDTO();
      (axiosClient.put as jest.Mock).mockResolvedValueOnce({
        data: submission,
      } as AxiosResponse);
      const submissionId = uuidv4();
      const answer = SubmissionAnswer.ACCEPTED;

      const result = await sut.updateAnswer(contestId, submissionId, answer);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/submissions/${submissionId}:update-answer`,
        {
          data: { answer },
        },
      );
      expect(result).toEqual(submission);
    });
  });

  describe("rerun", () => {
    it("should rerun the submission", async () => {
      const submission = MockSubmissionWithCodeResponseDTO();
      (axiosClient.put as jest.Mock).mockResolvedValueOnce({
        data: submission,
      } as AxiosResponse);
      const submissionId = uuidv4();

      const result = await sut.rerun(contestId, submissionId);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/submissions/${submissionId}:rerun`,
      );
      expect(result).toEqual(submission);
    });
  });
});
