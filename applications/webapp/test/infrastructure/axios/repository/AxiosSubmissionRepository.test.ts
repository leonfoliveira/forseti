import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { AxiosSubmissionRepository } from "@/infrastructure/axios/repository/AxiosSubmissionRepository";
import {
  MockCreateSubmissionRequestDTO,
  MockSubmissionWithCodeResponseDTO,
} from "@/test/mock/response/MockDTOs";

describe("AxiosSubmissionRepository", () => {
  it("creates a submission", async () => {
    const submission = MockSubmissionWithCodeResponseDTO();
    const client = { post: jest.fn().mockResolvedValue({ data: submission }) };
    const repository = new AxiosSubmissionRepository(client as never);
    const request = MockCreateSubmissionRequestDTO();

    await expect(repository.create("contest-42", request)).resolves.toBe(
      submission,
    );
    expect(client.post).toHaveBeenCalledWith(
      "/v1/contests/contest-42/submissions",
      { data: request },
    );
  });

  it("updates the answer for a submission", async () => {
    const submission = MockSubmissionWithCodeResponseDTO();
    const client = { put: jest.fn().mockResolvedValue({ data: submission }) };
    const repository = new AxiosSubmissionRepository(client as never);

    await expect(
      repository.updateAnswer(
        "contest-42",
        "submission-9",
        SubmissionAnswer.ACCEPTED,
      ),
    ).resolves.toBe(submission);
    expect(client.put).toHaveBeenCalledWith(
      "/v1/contests/contest-42/submissions/submission-9:update-answer",
      { data: { answer: SubmissionAnswer.ACCEPTED } },
    );
  });

  it("resubmits an existing submission", async () => {
    const submission = MockSubmissionWithCodeResponseDTO();
    const client = { put: jest.fn().mockResolvedValue({ data: submission }) };
    const repository = new AxiosSubmissionRepository(client as never);

    await expect(
      repository.resubmit("contest-42", "submission-9"),
    ).resolves.toBe(submission);
    expect(client.put).toHaveBeenCalledWith(
      "/v1/contests/contest-42/submissions/submission-9:resubmit",
    );
  });
});
