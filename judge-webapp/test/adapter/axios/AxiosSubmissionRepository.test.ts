
import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AxiosSubmissionRepository } from "@/adapter/axios/AxiosSubmissionRepository";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { MockSubmissionPublicResponseDTO } from "@/test/mock/response/submission/MockSubmissionPublicResponseDTO";

describe("AxiosSubmissionRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosSubmissionRepository(axiosClient);

  const contestId = uuidv4();

  describe("createSubmission", () => {
    it("should create a submission and return the full response", async () => {
      const request = { language: "java" } as any;
      const expectedResponse = MockSubmissionFullResponseDTO();
      axiosClient.post.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.createSubmission(contestId, request);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/submissions`,
        {
          data: request,
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findAllContestSubmissions", () => {
    it("should return an array of submissions for the contest", async () => {
      const expectedResponse = [
        MockSubmissionPublicResponseDTO(),
        MockSubmissionPublicResponseDTO(),
      ];
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findAllContestSubmissions(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/submissions`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findAllContestFullSubmissions", () => {
    it("should return an array of full submissions for the contest", async () => {
      const expectedResponse = [
        MockSubmissionFullResponseDTO(),
        MockSubmissionFullResponseDTO(),
      ];
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findAllContestFullSubmissions(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/submissions/full`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findAllFullForMember", () => {
    it("should return an array of full submissions for the member", async () => {
      const expectedResponse = [
        MockSubmissionFullResponseDTO(),
        MockSubmissionFullResponseDTO(),
      ];
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findAllFullForMember(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/submissions/full/members/me`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("updateSubmissionAnswer", () => {
    it("should update the submission answer", async () => {
      const submissionId = uuidv4();
      const answer = SubmissionAnswer.ACCEPTED;

      await sut.updateSubmissionAnswer(contestId, submissionId, answer);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/submissions/${submissionId}/answer/${answer}/force`,
      );
    });
  });

  describe("rerunSubmission", () => {
    it("should rerun the submission", async () => {
      const submissionId = uuidv4();

      await sut.rerunSubmission(contestId, submissionId);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/submissions/${submissionId}/rerun`,
      );
    });
  });
});
