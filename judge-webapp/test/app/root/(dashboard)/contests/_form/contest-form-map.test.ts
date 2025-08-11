import { ContestFormMap } from "@/app/root/(dashboard)/contests/_form/contest-form-map";
import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";

describe("ContestFormMap", () => {
  it("should map to CreateContestInputDTO", () => {
    const data = {
      slug: "contest-slug",
      title: "Test Contest",
      languages: [Language.PYTHON_3_13_3],
      startAt: new Date("2025-01-01T00:00:00Z"),
      endAt: new Date("2025-01-02T00:00:00Z"),
      members: [
        {
          type: MemberType.CONTESTANT,
          name: "Contestant",
          login: "contestant",
          password: "password123",
        },
      ],
      problems: [
        {
          letter: "A",
          title: "Problem A",
          newDescription: new File(["description"], "description.pdf", {
            type: "application/pdf",
          }),
          timeLimit: 1000,
          memoryLimit: 256,
          newTestCases: new File(["testCases"], "testCase.csv", {
            type: "text/csv",
          }),
        },
      ],
    };

    const result = ContestFormMap.toCreateRequestDTO(data);

    expect(result).toEqual({
      slug: data.slug,
      title: data.title,
      languages: data.languages,
      startAt: data.startAt.toISOString(),
      endAt: data.endAt.toISOString(),
      members: [
        {
          type: data.members[0].type,
          name: data.members[0].name,
          login: data.members[0].login,
          password: data.members[0].password,
        },
      ],
      problems: [
        {
          letter: data.problems[0].letter,
          title: data.problems[0].title,
          newDescription: data.problems[0].newDescription,
          timeLimit: data.problems[0].timeLimit,
          memoryLimit: data.problems[0].memoryLimit,
          newTestCases: data.problems[0].newTestCases,
        },
      ],
    });
  });

  it("should map to UpdateContestInputDTO", () => {
    const data = {
      id: "contest1",
      slug: "contest-slug",
      title: "Test Contest",
      languages: [Language.PYTHON_3_13_3],
      startAt: new Date("2025-01-01T00:00:00Z"),
      endAt: new Date("2025-01-02T00:00:00Z"),
      members: [
        {
          _id: "member1",
          type: MemberType.CONTESTANT,
          name: "Contestant",
          login: "contestant",
          password: "password123",
        },
      ],
      problems: [
        {
          _id: "problem1",
          letter: "A",
          title: "Problem A",
          description: {
            id: "old-description",
            filename: "old-description.pdf",
            contentType: "application/pdf",
          },
          newDescription: new File(["description"], "description.pdf", {
            type: "application/pdf",
          }),
          timeLimit: 1000,
          memoryLimit: 256,
          testCases: {
            id: "old-test-cases",
            filename: "old-test-cases.csv",
            contentType: "text/csv",
          },
          newTestCases: new File(["testCases"], "testCase.csv", {
            type: "text/csv",
          }),
        },
      ],
    };

    const result = ContestFormMap.toUpdateRequestDTO(data);

    expect(result).toEqual({
      id: data.id,
      slug: data.slug,
      title: data.title,
      languages: data.languages,
      startAt: data.startAt.toISOString(),
      endAt: data.endAt.toISOString(),
      members: [
        {
          id: data.members[0]._id,
          type: data.members[0].type,
          name: data.members[0].name,
          login: data.members[0].login,
          password: data.members[0].password,
        },
      ],
      problems: [
        {
          id: data.problems[0]._id,
          letter: data.problems[0].letter,
          title: data.problems[0].title,
          description: data.problems[0].description,
          newDescription: data.problems[0].newDescription,
          timeLimit: data.problems[0].timeLimit,
          memoryLimit: data.problems[0].memoryLimit,
          testCases: data.problems[0].testCases,
          newTestCases: data.problems[0].newTestCases,
        },
      ],
    });
  });

  it("should map to UpdateContestInputDTO without optional fields", () => {
    const data = {
      id: "contest1",
      slug: "contest-slug",
      title: "Test Contest",
      languages: [Language.PYTHON_3_13_3],
      startAt: new Date("2025-01-01T00:00:00Z"),
      endAt: new Date("2025-01-02T00:00:00Z"),
      members: [
        {
          _id: "member1",
          type: MemberType.CONTESTANT,
          name: "Contestant",
          login: "contestant",
        },
      ],
      problems: [
        {
          _id: "problem1",
          letter: "A",
          title: "Problem A",
          description: {
            id: "old-description",
            filename: "old-description.pdf",
            contentType: "application/pdf",
          },
          timeLimit: 1000,
          memoryLimit: 256,
          testCases: {
            id: "old-test-cases",
            filename: "old-test-cases.csv",
            contentType: "text/csv",
          },
        },
      ],
    };

    const result = ContestFormMap.toUpdateRequestDTO(data);

    expect(result).toEqual({
      id: data.id,
      slug: data.slug,
      title: data.title,
      languages: data.languages,
      startAt: data.startAt.toISOString(),
      endAt: data.endAt.toISOString(),
      members: [
        {
          id: data.members[0]._id,
          type: data.members[0].type,
          name: data.members[0].name,
          login: data.members[0].login,
          password: undefined,
        },
      ],
      problems: [
        {
          id: data.problems[0]._id,
          letter: data.problems[0].letter,
          title: data.problems[0].title,
          description: data.problems[0].description,
          newDescription: undefined,
          timeLimit: data.problems[0].timeLimit,
          memoryLimit: data.problems[0].memoryLimit,
          testCases: data.problems[0].testCases,
          newTestCases: undefined,
        },
      ],
    });
  });

  it("should map from ContestFullResponseDTO", () => {
    const contest = {
      id: "contest1",
      slug: "contest-slug",
      title: "Test Contest",
      languages: [Language.PYTHON_3_13_3],
      startAt: "2025-01-01T00:00:00Z",
      endAt: "2025-01-02T00:00:00Z",
      announcements: [],
      clarifications: [],
      members: [
        {
          id: "member1",
          type: MemberType.CONTESTANT,
          name: "Contestant",
          login: "contestant",
        },
      ],
      problems: [
        {
          id: "problem1",
          letter: "A",
          title: "Problem A",
          description: {
            id: "description1",
            filename: "description.pdf",
            contentType: "application/pdf",
          },
          timeLimit: 1000,
          memoryLimit: 256,
          testCases: {
            id: "testCases1",
            filename: "testCases.csv",
            contentType: "text/csv",
          },
        },
      ],
    };

    const result = ContestFormMap.fromResponseDTO(contest);

    expect(result).toEqual({
      id: contest.id,
      slug: contest.slug,
      title: contest.title,
      languages: contest.languages,
      originalStartAt: new Date(contest.startAt),
      startAt: new Date(contest.startAt),
      endAt: new Date(contest.endAt),
      members: [
        {
          _id: contest.members[0].id,
          type: contest.members[0].type,
          name: contest.members[0].name,
          login: contest.members[0].login,
        },
      ],
      problems: [
        {
          _id: contest.problems[0].id,
          letter: contest.problems[0].letter,
          title: contest.problems[0].title,
          description: contest.problems[0].description,
          newDescription: undefined,
          timeLimit: contest.problems[0].timeLimit,
          memoryLimit: contest.problems[0].memoryLimit,
          testCases: contest.problems[0].testCases,
          newTestCases: undefined,
        },
      ],
    });
  });
});
