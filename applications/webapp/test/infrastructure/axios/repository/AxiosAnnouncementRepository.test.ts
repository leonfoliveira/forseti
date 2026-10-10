import {
  MockAnnouncementResponseDTO,
  MockCreateAnnouncementRequestDTO,
} from "@/test/mock/response/MockDTOs";
import { AxiosAnnouncementRepository } from "@/infrastructure/axios/repository/AxiosAnnouncementRepository";

describe("AxiosAnnouncementRepository", () => {
  it("creates an announcement", async () => {
    const announcement = MockAnnouncementResponseDTO();
    const client = {
      post: jest.fn().mockResolvedValue({ data: announcement }),
    };
    const repository = new AxiosAnnouncementRepository(client as never);
    const request = MockCreateAnnouncementRequestDTO();

    await repository.create("contest-1", request);

    expect(client.post).toHaveBeenCalledWith(
      "/v1/contests/contest-1/announcements",
      { data: request },
    );
  });
});
