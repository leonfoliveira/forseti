import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";

import { AxiosAttachmentRepository } from "@/adapter/axios/AxiosAttachmentRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { MockAttachment } from "@/test/mock/model/MockAttachment";

describe("AxiosAttachmentRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosAttachmentRepository(axiosClient);

  const contestId = "contest-123";

  describe("upload", () => {
    it("should upload a file and return an attachment", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const expectedAttachment = MockAttachment();
      const context = AttachmentContext.PROBLEM_DESCRIPTION;
      axiosClient.post.mockResolvedValue({
        data: expectedAttachment,
      } as AxiosResponse);

      const result = await sut.upload(contestId, context, file);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/attachments/${context}`,
        {
          data: expect.any(FormData),
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      expect(result).toEqual(expectedAttachment);
    });
  });

  describe("download", () => {
    it("should download an attachment and return a file", async () => {
      const attachment = MockAttachment();
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

      const result = await sut.download(contestId, attachment);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/attachments/${attachment.id}`,
        { responseType: "blob" },
      );
      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe("download.txt");
      expect(result.type).toBe(contentType);
    });

    it("should handle missing filename in content-disposition", async () => {
      const attachment = MockAttachment();
      const blob = new Blob(["content"], { type: "text/plain" });

      axiosClient.get.mockResolvedValue({
        data: blob,
        headers: {
          "content-disposition": "attachment",
        },
      } as unknown as AxiosResponse);

      const result = await sut.download(contestId, attachment);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/attachments/${attachment.id}`,
        { responseType: "blob" },
      );
      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe("download");
      expect(result.type).toBe("application/octet-stream");
    });
  });
});
