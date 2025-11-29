import { parseAbsoluteToLocal } from "@internationalized/date";

import { SettingsFormMapper } from "@/app/[slug]/(dashboard)/settings/_form/settings-form-mapper";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";

describe("SettingsFormMapper", () => {
  const mockAttachment = {
    id: "attachment-1",
    filename: "test.txt",
    contentType: "text/plain",
  };

  const mockContestResponseDTO: ContestFullResponseDTO = {
    id: "contest-1",
    slug: "test-contest",
    title: "Test Contest",
    languages: [SubmissionLanguage.CPP_17, SubmissionLanguage.JAVA_21],
    startAt: "2025-09-03T10:00:00Z",
    endAt: "2025-09-03T18:00:00Z",
    settings: {
      isAutoJudgeEnabled: true,
    },
    problems: [
      {
        id: "problem-1",
        letter: "B",
        title: "Problem B",
        description: mockAttachment,
        timeLimit: 1000,
        memoryLimit: 256,
        testCases: mockAttachment,
      },
      {
        id: "problem-2",
        letter: "A",
        title: "Problem A",
        description: mockAttachment,
        timeLimit: 2000,
        memoryLimit: 512,
        testCases: mockAttachment,
      },
    ],
    members: [
      {
        id: "member-1",
        type: MemberType.CONTESTANT,
        name: "John Doe",
        login: "johndoe",
      },
      {
        id: "member-2",
        type: MemberType.ADMIN,
        name: "Jane Admin",
        login: "janeadmin",
      },
    ],
    announcements: [],
    clarifications: [],
  };

  describe("fromResponseDTOToForm", () => {
    it("should map contest response to form", () => {
      const result = SettingsFormMapper.fromResponseDTOToForm(
        mockContestResponseDTO,
      );

      expect(result).toEqual({
        id: "contest-1",
        slug: "test-contest",
        title: "Test Contest",
        languages: [SubmissionLanguage.CPP_17, SubmissionLanguage.JAVA_21],
        startAt: parseAbsoluteToLocal("2025-09-03T10:00:00Z"),
        endAt: parseAbsoluteToLocal("2025-09-03T18:00:00Z"),
        settings: {
          isAutoJudgeEnabled: true,
        },
        problems: [
          {
            _id: "problem-2",
            letter: "A",
            title: "Problem A",
            description: mockAttachment,
            newDescription: [],
            timeLimit: "2000",
            memoryLimit: "512",
            testCases: mockAttachment,
            newTestCases: [],
          },
          {
            _id: "problem-1",
            letter: "B",
            title: "Problem B",
            description: mockAttachment,
            newDescription: [],
            timeLimit: "1000",
            memoryLimit: "256",
            testCases: mockAttachment,
            newTestCases: [],
          },
        ],
        members: [
          {
            _id: "member-1",
            type: MemberType.CONTESTANT,
            name: "John Doe",
            login: "johndoe",
            password: undefined,
          },
          {
            _id: "member-2",
            type: MemberType.ADMIN,
            name: "Jane Admin",
            login: "janeadmin",
            password: undefined,
          },
        ],
      });
    });

    it("should sort problems by letter", () => {
      const result = SettingsFormMapper.fromResponseDTOToForm(
        mockContestResponseDTO,
      );

      expect(result.problems[0].title).toBe("Problem A");
      expect(result.problems[1].title).toBe("Problem B");
    });

    it("should convert time and memory limits to strings", () => {
      const result = SettingsFormMapper.fromResponseDTOToForm(
        mockContestResponseDTO,
      );

      expect(typeof result.problems[0].timeLimit).toBe("string");
      expect(typeof result.problems[0].memoryLimit).toBe("string");
      expect(result.problems[0].timeLimit).toBe("2000");
      expect(result.problems[0].memoryLimit).toBe("512");
    });

    it("should initialize empty password for all members", () => {
      const result = SettingsFormMapper.fromResponseDTOToForm(
        mockContestResponseDTO,
      );

      result.members.forEach((member) => {
        expect(member.password).toBeUndefined();
      });
    });

    it("should initialize empty file arrays", () => {
      const result = SettingsFormMapper.fromResponseDTOToForm(
        mockContestResponseDTO,
      );

      result.problems.forEach((problem) => {
        expect(problem.newDescription).toEqual([]);
        expect(problem.newTestCases).toEqual([]);
      });
    });
  });

  describe("fromFormToInputDTO", () => {
    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    const mockCsvFile = new File(["input,output"], "test.csv", {
      type: "text/csv",
    });

    const mockForm = {
      id: "contest-1",
      slug: "updated-contest",
      title: "Updated Contest",
      languages: [SubmissionLanguage.PYTHON_312],
      startAt: parseAbsoluteToLocal("2025-09-03T10:00:00Z"),
      endAt: parseAbsoluteToLocal("2025-09-03T18:00:00Z"),
      settings: {
        isAutoJudgeEnabled: false,
      },
      problems: [
        {
          _id: "problem-1",
          title: "Updated Problem A",
          description: mockAttachment,
          newDescription: [mockFile],
          timeLimit: "1500",
          memoryLimit: "384",
          testCases: mockAttachment,
          newTestCases: [mockCsvFile],
        },
        {
          title: "New Problem B",
          description: mockAttachment,
          newDescription: [],
          timeLimit: "2000",
          memoryLimit: "512",
          testCases: mockAttachment,
          newTestCases: [],
        },
      ],
      members: [
        {
          _id: "member-1",
          type: MemberType.CONTESTANT,
          name: "Updated John",
          login: "updatedjohn",
          password: "newpassword",
        },
        {
          type: MemberType.JUDGE,
          name: "New Judge",
          login: "newjudge",
          password: "judgepass",
        },
      ],
    };

    it("should map form to input DTO", () => {
      const result = SettingsFormMapper.fromFormToInputDTO(mockForm);

      expect(result).toEqual({
        id: "contest-1",
        slug: "updated-contest",
        title: "Updated Contest",
        languages: [SubmissionLanguage.PYTHON_312],
        startAt: "2025-09-03T10:00:00.000Z",
        endAt: "2025-09-03T18:00:00.000Z",
        settings: {
          isAutoJudgeEnabled: false,
        },
        problems: [
          {
            id: "problem-1",
            letter: "A",
            title: "Updated Problem A",
            description: mockAttachment,
            newDescription: mockFile,
            timeLimit: 1500,
            memoryLimit: 384,
            testCases: mockAttachment,
            newTestCases: mockCsvFile,
          },
          {
            id: undefined,
            letter: "B",
            title: "New Problem B",
            description: mockAttachment,
            newDescription: undefined,
            timeLimit: 2000,
            memoryLimit: 512,
            testCases: mockAttachment,
            newTestCases: undefined,
          },
        ],
        members: [
          {
            id: "member-1",
            type: MemberType.CONTESTANT,
            name: "Updated John",
            login: "updatedjohn",
            password: "newpassword",
          },
          {
            id: undefined,
            type: MemberType.JUDGE,
            name: "New Judge",
            login: "newjudge",
            password: "judgepass",
          },
        ],
      });
    });

    it("should assign letters alphabetically to problems", () => {
      const result = SettingsFormMapper.fromFormToInputDTO(mockForm);

      expect(result.problems[0].letter).toBe("A");
      expect(result.problems[1].letter).toBe("B");
    });

    it("should convert string limits to numbers", () => {
      const result = SettingsFormMapper.fromFormToInputDTO(mockForm);

      expect(typeof result.problems[0].timeLimit).toBe("number");
      expect(typeof result.problems[0].memoryLimit).toBe("number");
      expect(result.problems[0].timeLimit).toBe(1500);
      expect(result.problems[0].memoryLimit).toBe(384);
    });

    it("should convert ZonedDateTime to ISO string", () => {
      const result = SettingsFormMapper.fromFormToInputDTO(mockForm);

      expect(typeof result.startAt).toBe("string");
      expect(typeof result.endAt).toBe("string");
      expect(result.startAt).toBe("2025-09-03T10:00:00.000Z");
      expect(result.endAt).toBe("2025-09-03T18:00:00.000Z");
    });

    it("should extract first file from arrays", () => {
      const formWithMultipleFiles = {
        ...mockForm,
        problems: [
          {
            ...mockForm.problems[0],
            newDescription: [mockFile, new File(["extra"], "extra.txt")],
            newTestCases: [mockCsvFile, new File(["extra"], "extra.csv")],
          },
        ],
      };

      const result = SettingsFormMapper.fromFormToInputDTO(
        formWithMultipleFiles,
      );

      expect(result.problems[0].newDescription).toBe(mockFile);
      expect(result.problems[0].newTestCases).toBe(mockCsvFile);
    });

    it("should handle empty file arrays", () => {
      const formWithEmptyFiles = {
        ...mockForm,
        problems: [
          {
            ...mockForm.problems[0],
            newDescription: [],
            newTestCases: [],
          },
        ],
      };

      const result = SettingsFormMapper.fromFormToInputDTO(formWithEmptyFiles);

      expect(result.problems[0].newDescription).toBeUndefined();
      expect(result.problems[0].newTestCases).toBeUndefined();
    });

    it("should handle undefined file arrays", () => {
      const formWithUndefinedFiles = {
        ...mockForm,
        problems: [
          {
            ...mockForm.problems[0],
            newDescription: undefined,
            newTestCases: undefined,
          },
        ],
      };

      const result = SettingsFormMapper.fromFormToInputDTO(
        formWithUndefinedFiles,
      );

      expect(result.problems[0].newDescription).toBeUndefined();
      expect(result.problems[0].newTestCases).toBeUndefined();
    });
  });
});
