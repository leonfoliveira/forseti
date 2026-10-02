import { AxiosAuthenticationRepository } from "@/infrastructure/axios/repository/AxiosAuthenticationRepository";
import { MockAuthenticateRequestDTO, MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";

describe("AxiosAuthenticationRepository", () => {
  it("posts credentials to the contest sign-in endpoint and returns the session", async () => {
    const session = MockSessionResponseDTO();
    const client = { post: jest.fn().mockResolvedValue({ data: session }) };
    const repository = new AxiosAuthenticationRepository(client as never);
    const credentials = MockAuthenticateRequestDTO();

    await expect(repository.authenticate("contest-42", credentials)).resolves.toBe(
      session,
    );
    expect(client.post).toHaveBeenCalledWith(
      "/v1/contests/contest-42:sign-in",
      { data: credentials },
    );
  });
});
