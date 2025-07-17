import { SubmissionRepository } from "@/core/repository/SubmissionRepository";
import { mock } from "jest-mock-extended";
import { SubmissionService } from "@/core/service/SubmissionService";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { UpdateSubmissionAnswerRequestDTO } from "@/core/repository/dto/request/UpdateSubmissionAnswerRequestDTO";

describe("SubmissionService", () => {
  const submissionRepository = mock<SubmissionRepository>();

  const sut = new SubmissionService(submissionRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAllFullForMember", () => {
    it("should return all full submissions for member", async () => {
      const submissions = [
        { id: "submission1" },
        { id: "submission2" },
      ] as unknown as SubmissionFullResponseDTO[];
      submissionRepository.findAllFullForMember.mockResolvedValue(submissions);

      const result = await sut.findAllFullForMember();

      expect(result).toEqual(submissions);
    });
  });

  describe("updateSubmissionAnswer", () => {
    it("should update submission answer", async () => {
      const id = "submission-id";
      const data = {
        answer: SubmissionAnswer.ACCEPTED,
      } as UpdateSubmissionAnswerRequestDTO;
      await sut.updateSubmissionAnswer(id, data);

      expect(submissionRepository.updateSubmissionAnswer).toHaveBeenCalledWith(
        id,
        data,
      );
    });
  });

  describe("rerunSubmission", () => {
    it("should rerun submission", async () => {
      const id = "submission-id";
      await sut.rerunSubmission(id);

      expect(submissionRepository.rerunSubmission).toHaveBeenCalledWith(id);
    });
  });
});
