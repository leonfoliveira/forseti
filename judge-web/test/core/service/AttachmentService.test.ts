import { AttachmentService } from "@/core/service/AttachmentService";
import { AttachmentRepository } from "@/core/repository/AttachmentRepository";
import { Attachment } from "@/core/domain/model/Attachment";

describe("AttachmentService", () => {
  let attachmentService: AttachmentService;
  let attachmentRepositoryMock: jest.Mocked<AttachmentRepository>;

  beforeEach(() => {
    attachmentRepositoryMock = {
      upload: jest.fn(),
      download: jest.fn(),
    } as jest.Mocked<AttachmentRepository>;

    attachmentService = new AttachmentService(attachmentRepositoryMock);

    Object.defineProperty(global, "URL", {
      value: {
        createObjectURL: jest.fn(() => "blob:mock-url"),
        revokeObjectURL: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("upload", () => {
    it("should call the attachmentRepository.upload method with the provided file", async () => {
      const mockFile = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const expectedAttachment: Attachment = {
        id: "123",
        filename: "test.txt",
        contentType: "text/plain",
      };

      attachmentRepositoryMock.upload.mockResolvedValue(expectedAttachment);

      const result = await attachmentService.upload(mockFile);

      expect(attachmentRepositoryMock.upload).toHaveBeenCalledTimes(1);
      expect(attachmentRepositoryMock.upload).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual(expectedAttachment);
    });
  });

  describe("download", () => {
    const mockAttachment: Attachment = {
      id: "456",
      filename: "document.pdf",
      contentType: "application/pdf",
    };

    const file = new File(["mock content"], "document.pdf");

    beforeEach(() => {
      attachmentRepositoryMock.download.mockResolvedValue(file);
    });

    it("should call attachmentRepository.download with the provided attachment", async () => {
      await attachmentService.download(mockAttachment);
      expect(attachmentRepositoryMock.download).toHaveBeenCalledTimes(1);
      expect(attachmentRepositoryMock.download).toHaveBeenCalledWith(
        mockAttachment,
      );
    });

    it("should create an object URL from the downloaded blob", async () => {
      await attachmentService.download(mockAttachment);
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    it("should revoke the object URL after the download process", async () => {
      await attachmentService.download(mockAttachment);
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });
});
