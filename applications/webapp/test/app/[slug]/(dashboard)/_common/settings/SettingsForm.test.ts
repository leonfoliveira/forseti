import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { MockDate } from "@/test/mock/MockDate";
import { MemberType } from "@/domain/enumerate/MemberType";
import {
  SettingsForm,
  SettingsFormType,
} from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { MockContestWithMembersAndProblemsDTO } from "@/test/mock/response/MockDTOs";
import { DateTimeUtil } from "@/app/_lib/util/DateTimeUtil";
import { ArrayUtil } from "@/util/ArrayUtil";

describe("SettingsForm", () => {
  const validData: SettingsFormType = {
    contest: {
      slug: "test-slug",
      title: "Test Contest",
      languages: {
        [SubmissionLanguage.CPP_17]: true,
        [SubmissionLanguage.PYTHON_312]: true,
        [SubmissionLanguage.JAVA_21]: true,
        [SubmissionLanguage.NODE_22]: true,
      },
      startAt: MockDate.now().future(1).toDateTime(),
      endAt: MockDate.now().future(2).toDateTime(),
      autoFreezeAt: MockDate.now().future(1.5).toDateTime(),
      ipCIDRs: "0.0.0.0/0",
      settings: {
        isAutoJudgeEnabled: true,
        isClarificationEnabled: true,
        isPrintRequestEnabled: true,
        isSpectatorEnabled: true,
      },
    },
    problems: [
      {
        color: "#000000",
        title: "Test Problem",
        newDescription: [
          new File([], "description.pdf", { type: "application/pdf" }),
        ],
        timeLimitMs: "1000",
        memoryLimitMb: "256",
        newTestCases: [new File([], "test.csv", { type: "text/csv" })],
      },
    ],
    members: [
      {
        type: MemberType.CONTESTANT,
        name: "Ada Lovelace",
        login: "ada",
        password: "password",
        ip: "0.0.0.0",
      },
    ],
  };

  describe("schema", () => {
    const validate = (
      data: unknown,
      status: ContestStatus = ContestStatus.NOT_STARTED,
    ) => SettingsForm.schema(status).validate(data).error?.message;

    it("should validate the schema with valid data", () => {
      expect(validate(validData)).toBeUndefined();
    });

    it("validates slug", () => {
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, slug: undefined },
        }),
      ).toBe("Slug is required");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, slug: "" },
        }),
      ).toBe("Slug is required");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, slug: "a".repeat(31) },
        }),
      ).toBe("Slug must be at most 30 characters long");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, slug: "invalid slug" },
        }),
      ).toBe("Slug must only contain alphanumeric characters and hyphens");
    });

    it("validates title", () => {
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, title: undefined },
        }),
      ).toBe("Title is required");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, title: "" },
        }),
      ).toBe("Title is required");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, title: "a".repeat(201) },
        }),
      ).toBe("Title must be at most 200 characters long");
    });

    it("validates languages", () => {
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, languages: undefined },
        }),
      ).toBe("At least one language is required");
      expect(
        validate({
          ...validData,
          contest: {
            ...validData.contest,
            languages: {
              [SubmissionLanguage.CPP_17]: false,
              [SubmissionLanguage.PYTHON_312]: false,
              [SubmissionLanguage.JAVA_21]: false,
              [SubmissionLanguage.NODE_22]: false,
            },
          },
        }),
      ).toBe("At least one language is required");
    });

    it("validates startAt", () => {
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, startAt: undefined },
        }),
      ).toBe("Start date is required");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, startAt: "invalid-date" },
        }),
      ).toBe("Start date is invalid");
      expect(
        validate(
          {
            ...validData,
            contest: {
              ...validData.contest,
              startAt: MockDate.now().past(12).toDateTime(),
            },
          },
          ContestStatus.NOT_STARTED,
        ),
      ).toBe("Start date must be in the future");
      expect(
        validate(
          {
            ...validData,
            contest: {
              ...validData.contest,
              startAt: MockDate.now().past(1).toDateTime(),
            },
          },
          ContestStatus.IN_PROGRESS,
        ),
      ).toBeUndefined();
    });

    it("validates endAt", () => {
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, endAt: undefined },
        }),
      ).toBe("End date is required");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, endAt: "invalid-date" },
        }),
      ).toBe("End date is invalid");
      expect(
        validate({
          ...validData,
          contest: {
            ...validData.contest,
            startAt: MockDate.now().future(13).toDateTime(),
            endAt: MockDate.now().future(12).toDateTime(),
          },
        }),
      ).toBe("End date must be after the start date");
    });

    it("validates autoFreezeAt", () => {
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, autoFreezeAt: "" },
        }),
      ).toBeUndefined();
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, autoFreezeAt: undefined },
        }),
      ).toBeUndefined();
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, autoFreezeAt: "invalid-date" },
        }),
      ).toBe("Freeze date is invalid");
      expect(
        validate({
          ...validData,
          contest: {
            ...validData.contest,
            startAt: MockDate.now().future(12).toDateTime(),
            endAt: MockDate.now().future(13).toDateTime(),
            autoFreezeAt: MockDate.now().future(11).toDateTime(),
          },
        }),
      ).toContain("Freeze date must be after the start date");
      expect(
        validate({
          ...validData,
          contest: {
            ...validData.contest,
            startAt: MockDate.now().future(12).toDateTime(),
            endAt: MockDate.now().future(13).toDateTime(),
            autoFreezeAt: MockDate.now().future(14).toDateTime(),
          },
        }),
      ).toContain("Freeze date must be before the end date");
      expect(
        validate(
          {
            ...validData,
            contest: {
              ...validData.contest,
              startAt: MockDate.now().past(12).toDateTime(),
              endAt: MockDate.now().future(12).toDateTime(),
              autoFreezeAt: MockDate.now().past(11).toDateTime(),
            },
          },
          ContestStatus.IN_PROGRESS,
        ),
      ).toBe("Freeze date must be in the future");
    });

    it("validates ipCIDRs", () => {
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, ipCIDRs: "" },
        }),
      ).toBeUndefined();
      expect(
        validate({
          ...validData,
          contest: {
            ...validData.contest,
            ipCIDRs: "192.168.0.0/24, 10.0.0.0/8",
          },
        }),
      ).toBeUndefined();
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, ipCIDRs: "999.999.999.999/24" },
        }),
      ).toBe("IP CIDRs are invalid");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, ipCIDRs: "192.168.1.1" },
        }),
      ).toBe("IP CIDRs are invalid");
    });

    it("validates contest settings", () => {
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, settings: undefined },
        }),
      ).toBeDefined();
      expect(
        validate({
          ...validData,
          contest: {
            ...validData.contest,
            settings: {
              ...validData.contest.settings,
              isAutoJudgeEnabled: undefined,
            },
          },
        }),
      ).toBeDefined();
    });

    describe("problems validation", () => {
      const baseProblem = validData.problems[0];

      it("validates color", () => {
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, color: undefined }],
          }),
        ).toBe("Problem color is required");
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, color: "" }],
          }),
        ).toBe("Problem color is required");
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, color: "not-a-hex" }],
          }),
        ).toBe("Problem color is invalid");
      });

      it("validates title", () => {
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, title: undefined }],
          }),
        ).toBe("Problem title is required");
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, title: "" }],
          }),
        ).toBe("Problem title is required");
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, title: "a".repeat(201) }],
          }),
        ).toBe("Problem title is too long");
      });

      it("validates newDescription", () => {
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newDescription: undefined }],
          }),
        ).toBe("Problem description is required");
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newDescription: [] }],
          }),
        ).toBe("Problem description is required");

        const largePdf = new File(
          [new Uint8Array(10 * 1024 * 1024 + 1)],
          "large.pdf",
          { type: "application/pdf" },
        );
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newDescription: [largePdf] }],
          }),
        ).toBe("Problem description must be smaller than 10MB");

        const wrongTypeFile = new File([], "description.txt", {
          type: "text/plain",
        });
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newDescription: [wrongTypeFile] }],
          }),
        ).toBe("Problem description must be a PDF");

        // Optional when _id exists
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, _id: "prob-1", newDescription: [] }],
          }),
        ).toBeUndefined();
      });

      it("validates timeLimitMs and memoryLimitMb", () => {
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, timeLimitMs: undefined }],
          }),
        ).toBe("Problem time limit is required");
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, timeLimitMs: "0" }],
          }),
        ).toBeDefined();

        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, memoryLimitMb: undefined }],
          }),
        ).toBe("Problem memory limit is required");
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, memoryLimitMb: "-10" }],
          }),
        ).toBeDefined();
      });

      it("validates newTestCases", () => {
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newTestCases: undefined }],
          }),
        ).toBe("Problem test cases are required");
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newTestCases: [] }],
          }),
        ).toBe("Problem test cases are required");

        const largeCsv = new File(
          [new Uint8Array(10 * 1024 * 1024 + 1)],
          "large.csv",
          { type: "text/csv" },
        );
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newTestCases: [largeCsv] }],
          }),
        ).toBe("Problem test cases must be smaller than 10MB");

        const wrongTypeFile = new File([], "test.pdf", {
          type: "application/pdf",
        });
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newTestCases: [wrongTypeFile] }],
          }),
        ).toBe("Problem test cases must be a CSV");

        // Optional when _id exists
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, _id: "prob-1", newTestCases: [] }],
          }),
        ).toBeUndefined();
      });
    });

    describe("members validation", () => {
      const baseMember = validData.members[0];

      it("validates type", () => {
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, type: undefined }],
          }),
        ).toBe("Member type is required");
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, type: "" }],
          }),
        ).toBe("Member type is required");
      });

      it("validates name", () => {
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, name: undefined }],
          }),
        ).toBe("Member name is required");
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, name: "" }],
          }),
        ).toBe("Member name is required");
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, name: "a".repeat(51) }],
          }),
        ).toBe("Member name is too long");
      });

      it("validates login", () => {
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, login: undefined }],
          }),
        ).toBe("Member login is required");
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, login: "" }],
          }),
        ).toBe("Member login is required");
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, login: "a".repeat(31) }],
          }),
        ).toBe("Member login is too long");
      });

      it("validates password", () => {
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, password: undefined }],
          }),
        ).toBe("Member password is required");
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, password: "" }],
          }),
        ).toBe("Member password is required");
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, password: "a".repeat(31) }],
          }),
        ).toBe("Member password is too long");

        // Optional / allowed empty when _id exists
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, _id: "member-1", password: "" }],
          }),
        ).toBeUndefined();
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, _id: "member-1", password: undefined }],
          }),
        ).toBeUndefined();
      });

      it("validates ip", () => {
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, ip: "" }],
          }),
        ).toBeUndefined();
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, ip: "invalid-ip" }],
          }),
        ).toBe("Member IP must be a valid IP address");
      });
    });
  });

  describe("fromResponseDTO", () => {
    it("should correctly transform a response DTO to a form", () => {
      const responseDTO = MockContestWithMembersAndProblemsDTO();

      const formDTO = SettingsForm.fromResponseDTO(responseDTO);

      expect(formDTO).toEqual({
        contest: {
          slug: responseDTO.slug,
          title: responseDTO.title,
          languages: Object.fromEntries(
            Object.values(SubmissionLanguage).map((lang) => [
              lang,
              responseDTO.languages.includes(lang),
            ]),
          ),
          startAt: DateTimeUtil.toDatetimeLocal(responseDTO.startAt),
          endAt: DateTimeUtil.toDatetimeLocal(responseDTO.endAt),
          autoFreezeAt: responseDTO.autoFreezeAt
            ? DateTimeUtil.toDatetimeLocal(responseDTO.autoFreezeAt)
            : "",
          frozenAt: responseDTO.frozenAt,
          ipCIDRs: ArrayUtil.toString(responseDTO.ipCIDRs),
          settings: responseDTO.settings,
        },
        members: responseDTO.members.map((member) => ({
          _id: member.id,
          type: member.type,
          name: member.name,
          login: member.login,
          password: undefined,
          ip: member.ip ?? "",
        })),
        problems: responseDTO.problems
          .toSorted((a, b) => a.letter.localeCompare(b.letter))
          .map((problem) => ({
            _id: problem.id,
            color: problem.color,
            title: problem.title,
            description: problem.description,
            newDescription: [],
            timeLimitMs: problem.timeLimit.toString(),
            memoryLimitMb: problem.memoryLimit.toString(),
            testCases: problem.testCases,
            newTestCases: [],
          })),
      });
    });
  });

  describe("toInputDTO", () => {
    it("should convert the response DTO to the input DTO", () => {
      const responseDTO = SettingsForm.toInputDTO(validData);

      expect(responseDTO).toEqual({
        slug: validData.contest.slug,
        title: validData.contest.title,
        languages: [
          SubmissionLanguage.CPP_17,
          SubmissionLanguage.PYTHON_312,
          SubmissionLanguage.JAVA_21,
          SubmissionLanguage.NODE_22,
        ],
        startAt: DateTimeUtil.fromDatetimeLocal(validData.contest.startAt),
        endAt: DateTimeUtil.fromDatetimeLocal(validData.contest.endAt),
        autoFreezeAt: DateTimeUtil.fromDatetimeLocal(
          validData.contest.autoFreezeAt!!,
        ),
        frozenAt: validData.contest.frozenAt,
        ipCIDRs: [validData.contest.ipCIDRs],
        settings: validData.contest.settings,
        members: validData.members.map((member) => ({
          id: member._id,
          type: member.type,
          name: member.name,
          login: member.login,
          password: member.password,
          ip: member.ip,
        })),
        problems: validData.problems.map((problem) => ({
          id: problem._id,
          letter: "A",
          color: problem.color,
          title: problem.title,
          description: problem.description,
          newDescription: problem.newDescription!![0],
          timeLimitMs: parseInt(problem.timeLimitMs),
          memoryLimitMb: parseInt(problem.memoryLimitMb),
          testCases: problem.testCases,
          newTestCases: problem.newTestCases!![0],
        })),
      });
    });
  });
});
