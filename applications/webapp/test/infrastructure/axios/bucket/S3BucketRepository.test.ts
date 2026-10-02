import { S3BucketRepository } from "@/infrastructure/axios/bucket/S3BucketRepository";
import { MockAttachmentResponseDTO } from "@/test/mock/response/MockDTOs";

describe("S3BucketRepository", () => {
  const repository = new S3BucketRepository();
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("uploads the file to the signed URL with PUT", async () => {
    const file = new File(["contents"], "source.txt", { type: "text/plain" });
    global.fetch = jest.fn().mockResolvedValue({}) as jest.MockedFunction<
      typeof fetch
    >;

    await repository.upload("https://bucket.test/upload", file);

    expect(global.fetch).toHaveBeenCalledWith("https://bucket.test/upload", {
      method: "PUT",
      body: file,
    });
  });

  it("downloads a file using the attachment metadata", async () => {
    const blob = new Blob(["contents"], { type: "text/plain" });
    global.fetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue(blob),
    }) as jest.MockedFunction<typeof fetch>;
    const attachment = MockAttachmentResponseDTO({
      filename: "answer.txt",
      contentType: "text/plain",
    });

    const file = await repository.download(
      "https://bucket.test/download",
      attachment,
    );

    expect(global.fetch).toHaveBeenCalledWith("https://bucket.test/download");
    expect(file.name).toBe("answer.txt");
    expect(file.type).toBe("text/plain");
    expect(file.size).toBe(blob.size);
  });
});
