import { AttachmentContext } from "@/domain/enumerate/AttachmentContext";
import { AttachmentService } from "@/service/AttachmentService";
import {
  MockAttachmentResponseDTO,
  MockSignedDownloadAttachmentResponseDTO,
  MockSignedUploadAttachmentResponseDTO,
} from "@/test/mock/response/MockDTOs";

describe("AttachmentService", () => {
  const attachment = MockAttachmentResponseDTO();
  const repository = {
    getUploadSignedUrl: jest.fn(),
    getDownloadSignedUrl: jest.fn(),
  };
  const bucket = {
    upload: jest.fn(),
    download: jest.fn(),
  };
  const service = new AttachmentService(repository, bucket);

  beforeEach(() => {
    repository.getUploadSignedUrl.mockReset();
    repository.getDownloadSignedUrl.mockReset();
    bucket.upload.mockReset();
    bucket.download.mockReset();
  });

  it("gets an upload URL, uploads the file, and returns the attachment", async () => {
    const file = new File(["code"], "solution.cpp", {
      type: "text/plain",
    });
    repository.getUploadSignedUrl.mockResolvedValue(
      MockSignedUploadAttachmentResponseDTO({
        attachment,
        uploadUrl: "https://bucket.test/upload",
      }),
    );

    await expect(
      service.upload("contest-42", AttachmentContext.SUBMISSION_CODE, file),
    ).resolves.toBe(attachment);
    expect(repository.getUploadSignedUrl).toHaveBeenCalledWith("contest-42", {
      filename: file.name,
      context: AttachmentContext.SUBMISSION_CODE,
      contentType: file.type,
    });
    expect(bucket.upload).toHaveBeenCalledWith(
      "https://bucket.test/upload",
      file,
    );
  });

  it("downloads an attachment and triggers a browser download", async () => {
    const file = new File(["document"], attachment.filename, {
      type: attachment.contentType,
    });
    const createObjectURL = jest.fn(() => "blob:download");
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    repository.getDownloadSignedUrl.mockResolvedValue(
      MockSignedDownloadAttachmentResponseDTO({
        attachment,
        downloadUrl: "https://bucket.test/download",
      }),
    );
    bucket.download.mockResolvedValue(file);
    const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation();

    await expect(service.download("contest-42", attachment)).resolves.toBe(file);

    expect(bucket.download).toHaveBeenCalledWith(
      "https://bucket.test/download",
      attachment,
    );
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:download");
    click.mockRestore();
  });

  it("prints an attachment after the hidden frame loads", async () => {
    const file = new File(["document"], attachment.filename);
    const createObjectURL = jest.fn(() => "blob:print");
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    repository.getDownloadSignedUrl.mockResolvedValue(
      MockSignedDownloadAttachmentResponseDTO({
        attachment,
        downloadUrl: "https://bucket.test/print",
      }),
    );
    bucket.download.mockResolvedValue(file);

    await service.print("contest-42", attachment);
    const iframe = document.querySelector("iframe");
    const focus = jest.fn();
    const print = jest.fn();
    expect(iframe).not.toBeNull();
    Object.defineProperty(iframe, "contentWindow", {
      configurable: true,
      value: { focus, print },
    });
    iframe?.dispatchEvent(new Event("load"));

    expect(focus).toHaveBeenCalled();
    expect(print).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:print");
    expect(document.querySelector("iframe")).toBeNull();
  });
});
