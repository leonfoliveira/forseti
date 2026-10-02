import { AxiosAttachmentRepository } from "@/infrastructure/axios/repository/AxiosAttachmentRepository";
import {
  MockAttachmentResponseDTO,
  MockGetUploadSignedUrlRequest,
  MockSignedDownloadAttachmentResponseDTO,
  MockSignedUploadAttachmentResponseDTO,
} from "@/test/mock/response/MockDTOs";

describe("AxiosAttachmentRepository", () => {
  it("requests a signed upload URL with attachment details", async () => {
    const upload = MockSignedUploadAttachmentResponseDTO();
    const client = { post: jest.fn().mockResolvedValue({ data: upload }) };
    const repository = new AxiosAttachmentRepository(client as never);
    const request = MockGetUploadSignedUrlRequest();

    await expect(
      repository.getUploadSignedUrl("contest-42", request),
    ).resolves.toBe(upload);
    expect(client.post).toHaveBeenCalledWith(
      "/v1/contests/contest-42/attachments",
      { data: request },
    );
  });

  it("requests a signed download URL for an attachment", async () => {
    const download = MockSignedDownloadAttachmentResponseDTO();
    const attachment = MockAttachmentResponseDTO();
    const client = { get: jest.fn().mockResolvedValue({ data: download }) };
    const repository = new AxiosAttachmentRepository(client as never);

    await expect(
      repository.getDownloadSignedUrl("contest-42", attachment),
    ).resolves.toBe(download);
    expect(client.get).toHaveBeenCalledWith(
      `/v1/contests/contest-42/attachments/${attachment.id}`,
    );
  });
});
