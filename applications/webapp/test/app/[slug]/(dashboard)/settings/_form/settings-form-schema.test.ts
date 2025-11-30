import { now, getLocalTimeZone } from "@internationalized/date";

import { settingsFormSchema } from "@/app/[slug]/(dashboard)/settings/_form/settings-form-schema";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";

describe("settingsFormSchema", () => {
  const mockFile = new File(["test content"], "test.txt", {
    type: "text/plain",
  });
  const mockCsvFile = new File(["input,output\n1,1"], "test.csv", {
    type: "text/csv",
  });
  const largeMockFile = new File(
    [new ArrayBuffer(11 * 1024 * 1024)], // 11MB file
    "large.txt",
    { type: "text/plain" },
  );

  const futureDate = now(getLocalTimeZone()).add({ hours: 1 });
  const endDate = futureDate.add({ hours: 2 });

  const validData = {
    slug: "test-contest",
    title: "Test Contest",
    languages: [SubmissionLanguage.CPP_17],
    startAt: futureDate,
    endAt: endDate,
    problems: [
      {
        _id: "existing-problem-id", // Use existing problem to skip file validation
        title: "Test Problem",
        timeLimit: 1000,
        memoryLimit: 256,
      },
    ],
    members: [
      {
        _id: "existing-member-id", // Use existing member to allow empty password
        type: MemberType.CONTESTANT,
        name: "Test User",
        login: "testuser",
        password: "",
      },
    ],
  };

  describe("for NOT_STARTED contest", () => {
    const schema = settingsFormSchema(ContestStatus.NOT_STARTED);

    it("should validate data", () => {
      expect(schema.validate(validData).error?.message).toBeUndefined();
    });

    describe("slug", () => {
      it("should be required", () => {
        expect(
          schema.validate({ ...validData, slug: undefined }).error?.message,
        ).not.toBeUndefined();
      });

      it("should not be empty", () => {
        expect(
          schema.validate({ ...validData, slug: "" }).error?.message,
        ).not.toBeUndefined();
      });

      it("should have maximum 32 characters", () => {
        expect(
          schema.validate({ ...validData, slug: "a".repeat(33) }).error
            ?.message,
        ).not.toBeUndefined();
      });

      it("should match alphanumeric and hyphen pattern", () => {
        const result = schema.validate({ ...validData, slug: "" });
        expect(result.error?.message).not.toBeUndefined();
      });

      it("should allow valid pattern", () => {
        expect(
          schema.validate({ ...validData, slug: "valid-slug-123" }).error
            ?.message,
        ).toBeUndefined();
      });
    });

    describe("title", () => {
      it("should be required", () => {
        expect(
          schema.validate({ ...validData, title: undefined }).error?.message,
        ).not.toBeUndefined();
      });

      it("should not be empty", () => {
        expect(
          schema.validate({ ...validData, title: "" }).error?.message,
        ).not.toBeUndefined();
      });

      it("should have maximum 255 characters", () => {
        expect(
          schema.validate({ ...validData, title: "a".repeat(256) }).error
            ?.message,
        ).not.toBeUndefined();
      });
    });

    describe("languages", () => {
      it("should be required", () => {
        expect(
          schema.validate({ ...validData, languages: undefined }).error
            ?.message,
        ).not.toBeUndefined();
      });

      it("should not be empty array", () => {
        expect(
          schema.validate({ ...validData, languages: [] }).error?.message,
        ).not.toBeUndefined();
      });
    });

    describe("startAt", () => {
      it("should be required", () => {
        expect(
          schema.validate({ ...validData, startAt: undefined }).error?.message,
        ).not.toBeUndefined();
      });

      it("should be in the future for NOT_STARTED contest", () => {
        const pastDate = now(getLocalTimeZone()).subtract({ hours: 1 });
        expect(
          schema.validate({ ...validData, startAt: pastDate }).error?.message,
        ).not.toBeUndefined();
      });
    });

    describe("endAt", () => {
      it("should be required", () => {
        expect(
          schema.validate({ ...validData, endAt: undefined }).error?.message,
        ).not.toBeUndefined();
      });

      it("should be after startAt", () => {
        const earlierDate = futureDate.subtract({ minutes: 30 });
        expect(
          schema.validate({ ...validData, endAt: earlierDate }).error?.message,
        ).not.toBeUndefined();
      });
    });

    describe("problems", () => {
      it("should be required", () => {
        expect(
          schema.validate({ ...validData, problems: undefined }).error?.message,
        ).not.toBeUndefined();
      });

      describe("problem item", () => {
        it("should require title", () => {
          const invalidProblems = [{ ...validData.problems[0], title: "" }];
          expect(
            schema.validate({ ...validData, problems: invalidProblems }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should have title with maximum 255 characters", () => {
          const invalidProblems = [
            { ...validData.problems[0], title: "a".repeat(256) },
          ];
          expect(
            schema.validate({ ...validData, problems: invalidProblems }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should require newDescription for new problems", () => {
          const invalidProblems = [
            { title: "New Problem", timeLimit: 1000, memoryLimit: 256 },
          ];
          expect(
            schema.validate({ ...validData, problems: invalidProblems }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should validate new problems with files", () => {
          const validProblems = [
            {
              title: "New Problem",
              newDescription: [mockFile],
              timeLimit: 1000,
              memoryLimit: 256,
              newTestCases: [mockCsvFile],
            },
          ];

          const result = schema.validate({
            ...validData,
            problems: validProblems,
          });
          expect(result.error?.message).toBeUndefined();
        });

        it("should require timeLimit", () => {
          const invalidProblems = [
            { ...validData.problems[0], timeLimit: undefined },
          ];
          expect(
            schema.validate({ ...validData, problems: invalidProblems }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should require positive timeLimit", () => {
          const invalidProblems = [{ ...validData.problems[0], timeLimit: 0 }];
          expect(
            schema.validate({ ...validData, problems: invalidProblems }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should require memoryLimit", () => {
          const invalidProblems = [
            { ...validData.problems[0], memoryLimit: undefined },
          ];
          expect(
            schema.validate({ ...validData, problems: invalidProblems }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should require positive memoryLimit", () => {
          const invalidProblems = [
            { ...validData.problems[0], memoryLimit: 0 },
          ];
          expect(
            schema.validate({ ...validData, problems: invalidProblems }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should require newTestCases for new problems", () => {
          const invalidProblems = [
            {
              title: "New Problem",
              newDescription: [mockFile],
              timeLimit: 1000,
              memoryLimit: 256,
            },
          ];
          expect(
            schema.validate({ ...validData, problems: invalidProblems }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should reject large test cases files", () => {
          const invalidProblems = [
            {
              title: "New Problem",
              newDescription: [mockFile],
              timeLimit: 1000,
              memoryLimit: 256,
              newTestCases: [largeMockFile],
            },
          ];
          const result = schema.validate({
            ...validData,
            problems: invalidProblems,
          });
          expect(result.error?.message).not.toBeUndefined();
        });

        it("should require CSV format for test cases", () => {
          const invalidProblems = [
            {
              title: "New Problem",
              newDescription: [mockFile],
              timeLimit: 1000,
              memoryLimit: 256,
              newTestCases: [mockFile], // Wrong format - should be CSV
            },
          ];
          const result = schema.validate({
            ...validData,
            problems: invalidProblems,
          });
          expect(result.error?.message).not.toBeUndefined();
        });

        it("should allow existing problems without newDescription and newTestCases", () => {
          const existingProblem = {
            _id: "existing-id",
            title: "Existing Problem",
            timeLimit: 1000,
            memoryLimit: 256,
          };
          expect(
            schema.validate({ ...validData, problems: [existingProblem] }).error
              ?.message,
          ).toBeUndefined();
        });
      });
    });

    describe("members", () => {
      it("should be required", () => {
        expect(
          schema.validate({ ...validData, members: undefined }).error?.message,
        ).not.toBeUndefined();
      });

      describe("member item", () => {
        it("should require type", () => {
          const invalidMembers = [{ ...validData.members[0], type: undefined }];
          expect(
            schema.validate({ ...validData, members: invalidMembers }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should require name", () => {
          const invalidMembers = [{ ...validData.members[0], name: "" }];
          expect(
            schema.validate({ ...validData, members: invalidMembers }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should have name with maximum 64 characters", () => {
          const invalidMembers = [
            { ...validData.members[0], name: "a".repeat(65) },
          ];
          expect(
            schema.validate({ ...validData, members: invalidMembers }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should require login", () => {
          const invalidMembers = [{ ...validData.members[0], login: "" }];
          expect(
            schema.validate({ ...validData, members: invalidMembers }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should have login with maximum 32 characters", () => {
          const invalidMembers = [
            { ...validData.members[0], login: "a".repeat(33) },
          ];
          expect(
            schema.validate({ ...validData, members: invalidMembers }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should require password for new members", () => {
          const invalidMembers = [
            {
              type: MemberType.CONTESTANT,
              name: "New User",
              login: "newuser",
              password: "",
            },
          ];
          expect(
            schema.validate({ ...validData, members: invalidMembers }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should have password with maximum 32 characters", () => {
          const invalidMembers = [
            { ...validData.members[0], password: "a".repeat(33) },
          ];
          expect(
            schema.validate({ ...validData, members: invalidMembers }).error
              ?.message,
          ).not.toBeUndefined();
        });

        it("should allow empty password for existing members", () => {
          const existingMember = {
            _id: "existing-id",
            type: MemberType.CONTESTANT,
            name: "Existing User",
            login: "existinguser",
            password: "",
          };
          expect(
            schema.validate({ ...validData, members: [existingMember] }).error
              ?.message,
          ).toBeUndefined();
        });
      });
    });
  });

  describe("for IN_PROGRESS contest", () => {
    const schema = settingsFormSchema(ContestStatus.IN_PROGRESS);

    it("should allow past startAt for IN_PROGRESS contest", () => {
      const pastDate = now(getLocalTimeZone()).subtract({ hours: 1 });
      expect(
        schema.validate({ ...validData, startAt: pastDate }).error?.message,
      ).toBeUndefined();
    });
  });

  describe("for ENDED contest", () => {
    const schema = settingsFormSchema(ContestStatus.ENDED);

    it("should allow past startAt for ENDED contest", () => {
      const pastDate = now(getLocalTimeZone()).subtract({ hours: 1 });
      expect(
        schema.validate({ ...validData, startAt: pastDate }).error?.message,
      ).toBeUndefined();
    });
  });
});
