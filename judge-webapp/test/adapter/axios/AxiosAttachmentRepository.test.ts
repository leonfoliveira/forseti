import { mock } from "jest-mock-extended";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AxiosAttachmentRepository } from "@/adapter/axios/AxiosAttachmentRepository";
import { Attachment } from "@/core/domain/model/Attachment";
import { AxiosResponse } from "axios";

describe("AxiosAttachmentRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosAttachmentRepository(axiosClient);

  describe("upload", () => {
    it("should upload a file and return an attachment", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const expectedAttachment = { id: "123" } as unknown as Attachment;
      axiosClient.post.mockResolvedValue({
        data: expectedAttachment,
      } as AxiosResponse);

      const result = await sut.upload(file);

      expect(axiosClient.post).toHaveBeenCalledWith("/v1/attachments", {
        data: expect.any(FormData),
        headers: { "Content-Type": "multipart/form-data" },
      });
      expect(result).toEqual(expectedAttachment);
    });
  });

  describe("download", () => {
    it("should download an attachment and return a file", async () => {
      const attachment = { id: "123" } as unknown as Attachment;
      const blob = new Blob(["content"], { type: "text/plain" });
      const contentDisposition = 'attachment; filename="download.txt"';
      const contentType = "text/plain";

      axiosClient.get.mockResolvedValue({
        data: blob,
        headers: {
          "content-disposition": contentDisposition,
          "content-type": contentType,
        },
      } as unknown as AxiosResponse);

      const result = await sut.download(attachment);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/attachments/${attachment.id}`,
        { responseType: "blob" },
      );
      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe("download.txt");
      expect(result.type).toBe(contentType);
    });

    it("should handle missing filename in content-disposition", async () => {
      const attachment = { id: "123" } as unknown as Attachment;
      const blob = new Blob(["content"], { type: "text/plain" });

      axiosClient.get.mockResolvedValue({
        data: blob,
        headers: {
          "content-disposition": "attachment",
        },
      } as unknown as AxiosResponse);

      const result = await sut.download(attachment);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/attachments/${attachment.id}`,
        { responseType: "blob" },
      );
      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe("download");
      expect(result.type).toBe("application/octet-stream");
    });
  });
});
