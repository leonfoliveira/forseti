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
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation();

    await expect(service.download("contest-42", attachment)).resolves.toBe(
      file,
    );

    expect(bucket.download).toHaveBeenCalledWith(
      "https://bucket.test/download",
      attachment,
    );
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:download");
    click.mockRestore();
  });

  it("downloads an attachment, creates a hidden iframe, and triggers print", async () => {
    jest.useFakeTimers();

    const file = new File(["document content"], attachment.filename, {
      type: "application/pdf",
    });
    const createObjectURL = jest.fn(() => "blob:print-url");
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
        downloadUrl: "https://bucket.test/download-print",
      }),
    );
    bucket.download.mockResolvedValue(file);

    const focusSpy = jest.fn();
    const printSpy = jest.fn();

    const originalCreateElement = document.createElement.bind(document);
    jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === "iframe") {
          setTimeout(() => {
            Object.defineProperty(element, "contentWindow", {
              value: {
                focus: focusSpy,
                print: printSpy,
              },
              configurable: true,
            });
            if (element.onload) {
              (element.onload as any)(new Event("load"));
            }
          }, 0);
        }
        return element;
      });

    const removeChildSpy = jest.spyOn(document.body, "removeChild");

    const printPromise = service.print("contest-42", attachment);

    await jest.runAllTimersAsync();
    await printPromise;

    jest.advanceTimersByTime(500);
    expect(focusSpy).toHaveBeenCalled();
    expect(printSpy).toHaveBeenCalled();

    jest.advanceTimersByTime(1000);

    expect(bucket.download).toHaveBeenCalledWith(
      "https://bucket.test/download-print",
      attachment,
    );
    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:print-url");
    expect(removeChildSpy).toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});
