import { mock } from "jest-mock-extended";

import { AttachmentService } from "@/core/application/service/AttachmentService";
import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { AttachmentRepository } from "@/core/port/driven/repository/AttachmentRepository";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

describe("AttachmentService", () => {
  const attachmentRepository = mock<AttachmentRepository>();

  const sut = new AttachmentService(attachmentRepository);

  const contestId = "contest-1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("upload", () => {
    it("Should upload a file", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const attachment = {
        id: "1",
        filename: "test.txt",
        contentType: "text/plain",
      } as AttachmentResponseDTO;
      attachmentRepository.upload.mockResolvedValue(attachment);
      const context = AttachmentContext.PROBLEM_DESCRIPTION;

      const result = await sut.upload(contestId, context, file);

      expect(result).toEqual(attachment);
      expect(attachmentRepository.upload).toHaveBeenCalledWith(
        contestId,
        context,
        file,
      );
    });
  });

  describe("download", () => {
    (global.URL.createObjectURL as jest.Mock) = jest.fn(() => "blob:url");
    (global.URL.revokeObjectURL as jest.Mock) = jest.fn();

    it("Should download an attachment", async () => {
      const attachment = {
        id: "1",
        filename: "test.txt",
        contentType: "text/plain",
      } as AttachmentResponseDTO;
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      attachmentRepository.download.mockResolvedValue(file);

      const createObjectURLSpy = jest.spyOn(URL, "createObjectURL");
      const revokeObjectURLSpy = jest.spyOn(URL, "revokeObjectURL");
      const appendChildSpy = jest.spyOn(document.body, "appendChild");
      const removeChildSpy = jest.spyOn(document.body, "removeChild");

      await sut.download(contestId, attachment);

      expect(attachmentRepository.download).toHaveBeenCalledWith(
        contestId,
        attachment,
      );
      expect(createObjectURLSpy).toHaveBeenCalledWith(file);
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });
  });

  describe("print", () => {
    (global.URL.createObjectURL as jest.Mock) = jest.fn(() => "blob:url");
    (global.URL.revokeObjectURL as jest.Mock) = jest.fn();

    it("Should print an attachment", async () => {
      const attachment = {
        id: "1",
        filename: "test.txt",
        contentType: "text/plain",
      } as AttachmentResponseDTO;
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      attachmentRepository.download.mockResolvedValue(file);

      const createObjectURLSpy = jest.spyOn(URL, "createObjectURL");
      const revokeObjectURLSpy = jest.spyOn(URL, "revokeObjectURL");
      const appendChildSpy = jest.spyOn(document.body, "appendChild");
      const removeChildSpy = jest.spyOn(document.body, "removeChild");

      await sut.print(contestId, attachment);

      expect(attachmentRepository.download).toHaveBeenCalledWith(
        contestId,
        attachment,
      );
      expect(createObjectURLSpy).toHaveBeenCalledWith(file);
      expect(appendChildSpy).toHaveBeenCalled();
      const iframe = document.querySelector("iframe") as HTMLIFrameElement;
      expect(iframe).toBeInTheDocument();
      iframe.onload?.(new Event("load"));
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });
  });
});
