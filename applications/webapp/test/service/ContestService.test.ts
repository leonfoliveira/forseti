import { AttachmentContext } from "@/domain/enumerate/AttachmentContext";
import { ContestService } from "@/service/ContestService";
import {
  MockAttachmentResponseDTO,
  MockContestResponseDTO,
  MockContestWithMembersAndProblemsDTO,
  MockUpdateContestRequestDTO,
} from "@/test/mock/response/MockDTOs";

describe("ContestService", () => {
  const repository = {
    update: jest.fn(),
    findBySlug: jest.fn(),
    forceStart: jest.fn(),
    forceEnd: jest.fn(),
  };
  const attachmentService = { upload: jest.fn() };
  const service = new ContestService(repository, attachmentService as never);

  beforeEach(() => {
    Object.values(repository).forEach((method) => method.mockReset());
    attachmentService.upload.mockReset();
  });

  it("uploads replacement problem files before updating the contest", async () => {
    const descriptionFile = new File(["description"], "description.md");
    const testCasesFile = new File(["cases"], "cases.zip");
    const uploadedDescription = MockAttachmentResponseDTO({ id: "new-desc" });
    const uploadedTestCases = MockAttachmentResponseDTO({ id: "new-cases" });
    const result = MockContestWithMembersAndProblemsDTO();
    attachmentService.upload
      .mockResolvedValueOnce(uploadedDescription)
      .mockResolvedValueOnce(uploadedTestCases);
    repository.update.mockResolvedValue(result);
    const input = MockUpdateContestRequestDTO();
    const update = {
      ...input,
      problems: [
        {
          ...input.problems[0],
          newDescription: descriptionFile,
          newTestCases: testCasesFile,
        },
      ],
    };

    await expect(service.update("contest-42", update)).resolves.toBe(result);

    expect(attachmentService.upload).toHaveBeenNthCalledWith(
      1,
      "contest-42",
      AttachmentContext.PROBLEM_DESCRIPTION,
      descriptionFile,
    );
    expect(attachmentService.upload).toHaveBeenNthCalledWith(
      2,
      "contest-42",
      AttachmentContext.PROBLEM_TEST_CASES,
      testCasesFile,
    );
    expect(repository.update).toHaveBeenCalledWith(
      "contest-42",
      expect.objectContaining({
        problems: [
          expect.objectContaining({
            description: uploadedDescription,
            testCases: uploadedTestCases,
          }),
        ],
      }),
    );
  });

  it("passes existing attachments through without uploading them again", async () => {
    const update = MockUpdateContestRequestDTO();
    const existing = update.problems[0];
    repository.update.mockResolvedValue(MockContestWithMembersAndProblemsDTO());

    await service.update("contest-42", {
      ...update,
      problems: [
        {
          ...existing,
          description: existing.description,
          testCases: existing.testCases,
        },
      ],
    });

    expect(attachmentService.upload).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      "contest-42",
      expect.objectContaining({
        problems: [
          expect.objectContaining({
            description: existing.description,
            testCases: existing.testCases,
          }),
        ],
      }),
    );
  });

  it("delegates contest lookup and force operations", async () => {
    const contest = MockContestResponseDTO();
    const updated = MockContestWithMembersAndProblemsDTO();
    repository.findBySlug.mockResolvedValue(contest);
    repository.forceStart.mockResolvedValue(updated);
    repository.forceEnd.mockResolvedValue(updated);

    await expect(service.findBySlug("spring-contest")).resolves.toBe(contest);
    await expect(service.forceStart("contest-42")).resolves.toBe(updated);
    await expect(service.forceEnd("contest-42")).resolves.toBe(updated);
    expect(repository.findBySlug).toHaveBeenCalledWith("spring-contest");
    expect(repository.forceStart).toHaveBeenCalledWith("contest-42");
    expect(repository.forceEnd).toHaveBeenCalledWith("contest-42");
  });
});
