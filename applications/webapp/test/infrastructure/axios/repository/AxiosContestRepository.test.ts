import { AxiosContestRepository } from "@/infrastructure/axios/repository/AxiosContestRepository";
import {
  MockContestResponseDTO,
  MockContestWithMembersAndProblemsDTO,
  MockUpdateContestRequestDTO,
} from "@/test/mock/response/MockDTOs";

describe("AxiosContestRepository", () => {
  it("updates a contest and returns the updated details", async () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    const client = { put: jest.fn().mockResolvedValue({ data: contest }) };
    const repository = new AxiosContestRepository(client as never);
    const update = MockUpdateContestRequestDTO();

    await expect(repository.update("contest-42", update)).resolves.toBe(contest);
    expect(client.put).toHaveBeenCalledWith(
      "/v1/contests/contest-42",
      { data: update },
    );
  });

  it("looks up a contest by slug", async () => {
    const contest = MockContestResponseDTO();
    const client = { get: jest.fn().mockResolvedValue({ data: contest }) };
    const repository = new AxiosContestRepository(client as never);

    await expect(repository.findBySlug("spring-contest")).resolves.toBe(contest);
    expect(client.get).toHaveBeenCalledWith(
      "/v1/contests/slug/spring-contest",
    );
  });

  it.each(["force-start", "force-end"] as const)(
    "sends the %s operation to the contest endpoint",
    async (operation) => {
      const contest = MockContestWithMembersAndProblemsDTO();
      const client = { put: jest.fn().mockResolvedValue({ data: contest }) };
      const repository = new AxiosContestRepository(client as never);
      const result =
        operation === "force-start"
          ? repository.forceStart("contest-42")
          : repository.forceEnd("contest-42");

      await expect(result).resolves.toBe(contest);
      expect(client.put).toHaveBeenCalledWith(
        `/v1/contests/contest-42:${operation}`,
      );
    },
  );
});
