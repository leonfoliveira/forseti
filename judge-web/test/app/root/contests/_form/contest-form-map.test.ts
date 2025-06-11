import {
  fromResponseDTO,
  toCreateContestRequestDTO,
} from "@/app/root/(dashboard)/contests/_form/contest-form-map";
import { ContestFormType } from "@/app/root/(dashboard)/contests/_form/contest-form-type";
import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";

describe("contest form mapping functions", () => {
  const data: ContestFormType = {
    title: "Test Contest",
    languages: [Language.PYTHON_3_13_3],
    startAt: new Date("2024-01-01T00:00:00Z"),
    endAt: new Date("2024-01-02T00:00:00Z"),
    members: [
      {
        type: MemberType.CONTESTANT,
        name: "Alice",
        login: "alice123",
        password: "password123",
      },
    ],
    problems: [
      {
        title: "Problem 1",
        newDescription: new File(["description"], "problem1.txt"),
        timeLimit: 1000,
        newTestCases: new File(["test cases"], "problem1_test_cases.txt"),
      },
    ],
  };

  it("map to CreateContestInputDTO correctly", () => {
    const result = toCreateContestRequestDTO(data);
    expect(result).toEqual(data);
  });

  it("map to UpdateContestInputDTO correctly", () => {
    const result = toCreateContestRequestDTO(data);
    expect(result).toEqual(data);
  });

  it("map from ContestPrivateResponseDTO", () => {
    const contest: ContestFullResponseDTO = {
      id: 1,
      title: "Test Contest",
      languages: [Language.PYTHON_3_13_3],
      startAt: "2024-01-01T00:00:00Z",
      endAt: "2024-01-02T00:00:00Z",
      members: [
        {
          id: 1,
          type: MemberType.CONTESTANT,
          name: "Alice",
          login: "alice123",
        },
      ],
      problems: [
        {
          id: 1,
          title: "Problem 1",
          description: {
            key: "1",
            filename: "problem1.txt",
            contentType: "text/plain",
          },
          timeLimit: 1000,
          testCases: {
            key: "1",
            filename: "problem1_test_cases.txt",
            contentType: "text/plain",
          },
        },
      ],
    };
    const result = fromResponseDTO(contest);
    expect(result).toEqual({
      id: 1,
      title: "Test Contest",
      languages: [Language.PYTHON_3_13_3],
      startAt: new Date("2024-01-01T00:00:00Z"),
      endAt: new Date("2024-01-02T00:00:00Z"),
      members: [
        {
          _id: 1,
          type: MemberType.CONTESTANT,
          name: "Alice",
          login: "alice123",
        },
      ],
      problems: [
        {
          _id: 1,
          title: "Problem 1",
          description: {
            key: "1",
            filename: "problem1.txt",
            contentType: "text/plain",
          },
          timeLimit: 1000,
          testCases: {
            key: "1",
            filename: "problem1_test_cases.txt",
            contentType: "text/plain",
          },
        },
      ],
    });
  });
});
