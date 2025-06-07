import { SubmissionService } from "@/core/service/SubmissionService";
import { SubmissionRepository } from "@/core/repository/SubmissionRepository";
import { AttachmentService } from "@/core/service/AttachmentService";
import { StompSubmissionListener } from "@/adapter/stomp/StompSubmissionListener";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/SubmissionFullResponseDTO";
import { mock, MockProxy } from "jest-mock-extended";
import { Attachment } from "@/core/domain/model/Attachment";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { UpdateSubmissionAnswerRequestDTO } from "@/core/repository/dto/request/UpdateSubmissionAnswerRequestDTO";

jest.mock("@/core/repository/SubmissionRepository");
jest.mock("@/core/service/AttachmentService");
jest.mock("@/adapter/stomp/StompSubmissionListener");

describe("SubmissionService", () => {
  let submissionRepository: MockProxy<SubmissionRepository>;
  let attachmentService: MockProxy<AttachmentService>;
  let submissionListener: MockProxy<StompSubmissionListener>;
  let submissionService: SubmissionService;

  beforeEach(() => {
    submissionRepository = mock<SubmissionRepository>();
    attachmentService = mock<AttachmentService>();
    submissionListener = mock<StompSubmissionListener>();
    submissionService = new SubmissionService(
      submissionRepository,
      submissionListener,
      attachmentService,
    );
  });

  describe("findAllFullForMember", () => {
    it("returns all submissions for the member", async () => {
      const submissions = [mock<SubmissionFullResponseDTO>()];
      submissionRepository.findAllFullForMember.mockResolvedValue(submissions);

      const result = await submissionService.findAllFullForMember();

      expect(submissionRepository.findAllFullForMember).toHaveBeenCalled();
      expect(result).toEqual(submissions);
    });
  });

  describe("updateSubmissionAnswer", () => {
    it("updates the submission answer", async () => {
      const id = "submission-id";
      const data = mock<UpdateSubmissionAnswerRequestDTO>();

      await submissionService.updateSubmissionAnswer(id, data);

      expect(submissionRepository.updateSubmissionAnswer).toHaveBeenCalledWith(
        id,
        data,
      );
    });
  });

  describe("rerunSubmission", () => {
    it("reruns the submission", async () => {
      const id = "submission-id";

      await submissionService.rerunSubmission(id);

      expect(submissionRepository.rerunSubmission).toHaveBeenCalledWith(id);
    });
  });

  describe("createSubmission", () => {
    it("creates a submission and returns the response", async () => {
      const input = mock<CreateSubmissionInputDTO>();
      const uploadedAttachment = mock<Attachment>();
      const response = mock<SubmissionFullResponseDTO>();

      attachmentService.upload.mockResolvedValue(uploadedAttachment);
      submissionRepository.createSubmission.mockResolvedValue(response);

      const result = await submissionService.createSubmission(input);

      expect(attachmentService.upload).toHaveBeenCalledWith(input.code);
      expect(submissionRepository.createSubmission).toHaveBeenCalledWith({
        problemId: input.problemId,
        language: input.language,
        code: uploadedAttachment,
      });
      expect(result).toEqual(response);
    });
  });

  describe("subscribeForContest", () => {
    it("subscribes to contest submissions and invokes the callback", async () => {
      const contestId = 1;
      const callback = jest.fn();
      const client = mock<ListenerClient>();

      submissionListener.subscribeForContest.mockResolvedValue(client);

      const result = await submissionService.subscribeForContest(
        contestId,
        callback,
      );

      expect(submissionListener.subscribeForContest).toHaveBeenCalledWith(
        contestId,
        callback,
      );
      expect(result).toBe(client);
    });
  });

  describe("subscribeForContestFull", () => {
    it("subscribes to contest full submissions and invokes the callback", async () => {
      const contestId = 1;
      const callback = jest.fn();
      const client = mock<ListenerClient>();

      submissionListener.subscribeForContestFull.mockResolvedValue(client);

      const result = await submissionService.subscribeForContestFull(
        contestId,
        callback,
      );

      expect(submissionListener.subscribeForContestFull).toHaveBeenCalledWith(
        contestId,
        callback,
      );
      expect(result).toBe(client);
    });
  });

  describe("subscribeForMember", () => {
    it("subscribes to member submissions and invokes the callback", async () => {
      const memberId = 123;
      const callback = jest.fn();
      const client = mock<ListenerClient>();

      submissionListener.subscribeForMember.mockResolvedValue(client);

      const result = await submissionService.subscribeForMember(
        memberId,
        callback,
      );

      expect(submissionListener.subscribeForMember).toHaveBeenCalledWith(
        memberId,
        callback,
      );
      expect(result).toBe(client);
    });
  });

  describe("unsubscribe", () => {
    it("unsubscribes the given client", async () => {
      const client = mock<ListenerClient>();

      await submissionService.unsubscribe(client);

      expect(client.unsubscribe).toHaveBeenCalled();
    });
  });
});
