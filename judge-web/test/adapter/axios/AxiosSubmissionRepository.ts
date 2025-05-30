import { AxiosSubmissionRepository } from "@/adapter/axios/AxiosSubmissionRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";
import { SubmissionPrivateResponseDTO } from "@/core/repository/dto/response/SubmissionPrivateResponseDTO";
import { mock, MockProxy } from "jest-mock-extended";
import { AxiosResponse } from "axios";

jest.mock("@/adapter/axios/AxiosClient");

describe("AxiosSubmissionRepository", () => {
  let axiosClient: MockProxy<AxiosClient>;
  let submissionRepository: AxiosSubmissionRepository;

  beforeEach(() => {
    axiosClient = mock<AxiosClient>();
    submissionRepository = new AxiosSubmissionRepository(axiosClient);
  });

  describe("findAllForMember", () => {
    it("returns all submissions for the current member", async () => {
      const response = [mock<SubmissionPrivateResponseDTO>()];
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await submissionRepository.findAllForMember();

      expect(axiosClient.get).toHaveBeenCalledWith("/v1/submissions/me");
      expect(result).toEqual(response);
    });
  });

  describe("createSubmission", () => {
    it("creates a submission and returns the private response DTO", async () => {
      const request = mock<CreateSubmissionRequestDTO>();
      const response = mock<SubmissionPrivateResponseDTO>();
      axiosClient.post.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await submissionRepository.createSubmission(request);

      expect(axiosClient.post).toHaveBeenCalledWith("/v1/submissions", {
        data: request,
      });
      expect(result).toEqual(response);
    });
  });
});
