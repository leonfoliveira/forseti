import { AuthenticationService } from "@/service/AuthenticationService";
import { MockAuthenticateRequestDTO, MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";

describe("AuthenticationService", () => {
  it("delegates authentication to its repository", async () => {
    const session = MockSessionResponseDTO();
    const repository = {
      authenticate: jest.fn().mockResolvedValue(session),
    };
    const service = new AuthenticationService(repository);
    const request = MockAuthenticateRequestDTO();

    await expect(service.authenticate("contest-42", request)).resolves.toBe(
      session,
    );
    expect(repository.authenticate).toHaveBeenCalledWith("contest-42", request);
  });
});
