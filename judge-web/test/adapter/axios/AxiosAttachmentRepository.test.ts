import { AxiosAttachmentRepository } from "@/adapter/axios/AxiosAttachmentRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { Attachment } from "@/core/domain/model/Attachment";
import { mock } from "jest-mock-extended";
import { AxiosResponse } from "axios";

describe("AxiosAttachmentRepository", () => {
  let axiosClient: jest.Mocked<AxiosClient>;
  let attachmentRepository: AxiosAttachmentRepository;

  beforeEach(() => {
    axiosClient = mock<AxiosClient>();
    attachmentRepository = new AxiosAttachmentRepository(axiosClient);
  });

  describe("upload", () => {
    it("uploads a file and returns the attachment", async () => {
      const file = new File(["content"], "file.txt");
      const response = mock<Attachment>();
      axiosClient.post.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await attachmentRepository.upload(file);

      expect(axiosClient.post).toHaveBeenCalledWith("/v1/attachments", {
        data: expect.any(FormData),
        headers: { "Content-Type": "multipart/form-data" },
      });
      expect(result).toEqual(response);
    });
  });

  describe("download", () => {
    it("downloads an attachment and returns the response DTO", async () => {
      const attachment = mock<Attachment>();
      const blob = new Blob(["content"], { type: "text/plain" });
      const response = {
        data: blob,
        headers: {
          "content-disposition": 'attachment; filename="file.txt"',
          "content-type": "text/plain",
        },
      } as unknown as AxiosResponse;
      axiosClient.get.mockResolvedValue(response);

      const result = await attachmentRepository.download(attachment);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/attachments/${attachment.id}`,
        {
          responseType: "blob",
        },
      );
      expect(result).toEqual(
        new File([response.data], "file.txt", {
          type: "text/plain",
        }),
      );
    });
  });
});
