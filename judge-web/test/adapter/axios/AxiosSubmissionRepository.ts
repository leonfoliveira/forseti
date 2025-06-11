import { AxiosSubmissionRepository } from "@/adapter/axios/AxiosSubmissionRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { mock, MockProxy } from "jest-mock-extended";
import { AxiosResponse } from "axios";
import { UpdateSubmissionAnswerRequestDTO } from "@/core/repository/dto/request/UpdateSubmissionAnswerRequestDTO";

jest.mock("@/adapter/axios/AxiosClient");

describe("AxiosSubmissionRepository", () => {
  let axiosClient: MockProxy<AxiosClient>;
  let submissionRepository: AxiosSubmissionRepository;

  beforeEach(() => {
    axiosClient = mock<AxiosClient>();
    submissionRepository = new AxiosSubmissionRepository(axiosClient);
  });

  describe("findAllFullForMember", () => {
    it("returns all submissions for the current member", async () => {
      const response = [mock<SubmissionFullResponseDTO>()];
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await submissionRepository.findAllFullForMember();

      expect(axiosClient.get).toHaveBeenCalledWith("/v1/submissions/me");
      expect(result).toEqual(response);
    });
  });

  describe("createSubmission", () => {
    it("creates a submission and returns the private response DTO", async () => {
      const request = mock<CreateSubmissionRequestDTO>();
      const response = mock<SubmissionFullResponseDTO>();
      axiosClient.post.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await submissionRepository.createSubmission(request);

      expect(axiosClient.post).toHaveBeenCalledWith("/v1/submissions", {
        data: request,
      });
      expect(result).toEqual(response);
    });
  });

  describe("updateSubmissionAnswer", () => {
    it("updates a submission answer", async () => {
      const id = "submission-id";
      const data = mock<UpdateSubmissionAnswerRequestDTO>();
      axiosClient.patch.mockResolvedValue({} as AxiosResponse);

      await submissionRepository.updateSubmissionAnswer(id, data);

      expect(axiosClient.patch).toHaveBeenCalledWith(
        `/v1/submissions/${id}/judge`,
        {
          data,
        },
      );
    });
  });

  describe("rerunSubmission", () => {
    it("reruns a submission", async () => {
      const id = "submission-id";
      axiosClient.post.mockResolvedValue({} as AxiosResponse);

      await submissionRepository.rerunSubmission(id);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/submissions/${id}/rerun`,
      );
    });
  });
});
