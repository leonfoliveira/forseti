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
      ).toBe("[slug].(dashboard)._common.settings.SettingsForm.slugRequired");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, slug: "" },
        }),
      ).toBe("[slug].(dashboard)._common.settings.SettingsForm.slugRequired");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, slug: "a".repeat(31) },
        }),
      ).toBe("[slug].(dashboard)._common.settings.SettingsForm.slugTooLong");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, slug: "invalid slug" },
        }),
      ).toBe(
        "[slug].(dashboard)._common.settings.SettingsForm.slugPatternInvalid",
      );
    });

    it("validates title", () => {
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, title: undefined },
        }),
      ).toBe("[slug].(dashboard)._common.settings.SettingsForm.titleRequired");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, title: "" },
        }),
      ).toBe("[slug].(dashboard)._common.settings.SettingsForm.titleRequired");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, title: "a".repeat(201) },
        }),
      ).toBe("[slug].(dashboard)._common.settings.SettingsForm.titleTooLong");
    });

    it("validates languages", () => {
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, languages: undefined },
        }),
      ).toBe(
        "[slug].(dashboard)._common.settings.SettingsForm.languagesRequired",
      );
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
      ).toBe(
        "[slug].(dashboard)._common.settings.SettingsForm.languagesRequired",
      );
    });

    it("validates startAt", () => {
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, startAt: undefined },
        }),
      ).toBe(
        "[slug].(dashboard)._common.settings.SettingsForm.startAtRequired",
      );
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, startAt: "invalid-date" },
        }),
      ).toBe("[slug].(dashboard)._common.settings.SettingsForm.startAtInvalid");
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
      ).toBe("[slug].(dashboard)._common.settings.SettingsForm.startAtFuture");
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
      ).toBe("[slug].(dashboard)._common.settings.SettingsForm.endAtRequired");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, endAt: "invalid-date" },
        }),
      ).toBe("[slug].(dashboard)._common.settings.SettingsForm.endAtInvalid");
      expect(
        validate({
          ...validData,
          contest: {
            ...validData.contest,
            startAt: MockDate.now().future(13).toDateTime(),
            endAt: MockDate.now().future(12).toDateTime(),
          },
        }),
      ).toBe(
        "[slug].(dashboard)._common.settings.SettingsForm.endAtAfterStart",
      );
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
      ).toBe(
        "[slug].(dashboard)._common.settings.SettingsForm.autoFreezeAtInvalid",
      );
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
      ).toContain(
        "[slug].(dashboard)._common.settings.SettingsForm.autoFreezeAtBeforeStart",
      );
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
      ).toContain(
        "[slug].(dashboard)._common.settings.SettingsForm.autoFreezeAtAfterEnd",
      );
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
      ).toBe(
        "[slug].(dashboard)._common.settings.SettingsForm.autoFreezeAtFuture",
      );
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
      ).toBe("[slug].(dashboard)._common.settings.SettingsForm.ipCIDRsInvalid");
      expect(
        validate({
          ...validData,
          contest: { ...validData.contest, ipCIDRs: "192.168.1.1" },
        }),
      ).toBe("[slug].(dashboard)._common.settings.SettingsForm.ipCIDRsInvalid");
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
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemColorRequired",
        );
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, color: "" }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemColorRequired",
        );
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, color: "not-a-hex" }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemColorInvalid",
        );
      });

      it("validates title", () => {
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, title: undefined }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemTitleRequired",
        );
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, title: "" }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemTitleRequired",
        );
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, title: "a".repeat(201) }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemTitleTooLong",
        );
      });

      it("validates newDescription", () => {
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newDescription: undefined }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemDescriptionRequired",
        );
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newDescription: [] }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemDescriptionRequired",
        );

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
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemDescriptionTooLarge",
        );

        const wrongTypeFile = new File([], "description.txt", {
          type: "text/plain",
        });
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newDescription: [wrongTypeFile] }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemDescriptionPDF",
        );

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
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemTimeLimitRequired",
        );
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, timeLimitMs: "0" }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemTimeLimitPositive",
        );

        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, memoryLimitMb: undefined }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemMemoryLimitRequired",
        );
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, memoryLimitMb: "-10" }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemMemoryLimitPositive",
        );
      });

      it("validates newTestCases", () => {
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newTestCases: undefined }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemTestCasesRequired",
        );
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newTestCases: [] }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemTestCasesRequired",
        );

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
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemTestCasesTooLarge",
        );

        const wrongTypeFile = new File([], "test.pdf", {
          type: "application/pdf",
        });
        expect(
          validate({
            ...validData,
            problems: [{ ...baseProblem, newTestCases: [wrongTypeFile] }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.problemTestCasesCSV",
        );

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
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.memberTypeRequired",
        );
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, type: "" }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.memberTypeRequired",
        );
      });

      it("validates name", () => {
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, name: undefined }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.memberNameRequired",
        );
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, name: "" }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.memberNameRequired",
        );
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, name: "a".repeat(51) }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.memberNameTooLong",
        );
      });

      it("validates login", () => {
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, login: undefined }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.memberLoginRequired",
        );
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, login: "" }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.memberLoginRequired",
        );
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, login: "a".repeat(31) }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.memberLoginTooLong",
        );
      });

      it("validates password", () => {
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, password: undefined }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.memberPasswordRequired",
        );
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, password: "" }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.memberPasswordRequired",
        );
        expect(
          validate({
            ...validData,
            members: [{ ...baseMember, password: "a".repeat(31) }],
          }),
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.memberPasswordTooLong",
        );

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
        ).toBe(
          "[slug].(dashboard)._common.settings.SettingsForm.memberIpInvalid",
        );
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
