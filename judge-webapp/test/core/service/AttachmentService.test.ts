import { mock } from "jest-mock-extended";
import { AttachmentRepository } from "@/core/repository/AttachmentRepository";
import { AttachmentService } from "@/core/service/AttachmentService";
import { Attachment } from "@/core/domain/model/Attachment";

describe("AttachmentService", () => {
  const attachmentRepository = mock<AttachmentRepository>();

  const sut = new AttachmentService(attachmentRepository);

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
      } as Attachment;
      attachmentRepository.upload.mockResolvedValue(attachment);

      const result = await sut.upload(file);

      expect(result).toEqual(attachment);
      expect(attachmentRepository.upload).toHaveBeenCalledWith(file);
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
      } as Attachment;
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      attachmentRepository.download.mockResolvedValue(file);

      const createObjectURLSpy = jest.spyOn(URL, "createObjectURL");
      const revokeObjectURLSpy = jest.spyOn(URL, "revokeObjectURL");
      const appendChildSpy = jest.spyOn(document.body, "appendChild");
      const removeChildSpy = jest.spyOn(document.body, "removeChild");

      await sut.download(attachment);

      expect(createObjectURLSpy).toHaveBeenCalledWith(file);
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });
  });
});
