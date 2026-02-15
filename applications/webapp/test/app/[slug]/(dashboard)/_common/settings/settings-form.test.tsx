import {
  SettingsForm,
  SettingsFormType,
} from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachment";
import { MockContestFullResponseDTO } from "@/test/mock/response/contest/MockContestFullResponseDTO";

describe("SettingsForm", () => {
  const mockAttachment: AttachmentResponseDTO = MockAttachmentResponseDTO();

  // Mock File objects for testing
  const mockDescriptionFile = {
    name: "problem.md",
    type: "text/markdown",
    size: 1024,
  };
  const mockTestCasesFile = { name: "test.csv", type: "text/csv", size: 2048 };

  const validFormData = {
    contest: {
      slug: "test-contest",
      title: "Test Contest",
      languages: {
        [SubmissionLanguage.CPP_17]: true,
        [SubmissionLanguage.JAVA_21]: false,
        [SubmissionLanguage.PYTHON_312]: false,
      },
      startAt: "2026-12-31T10:00",
      endAt: "2026-12-31T18:00",
      autoFreezeAt: "2026-12-31T12:00",
      settings: {
        isAutoJudgeEnabled: true,
      },
    },
    problems: [
      {
        title: "Problem A",
        description: mockAttachment,
        newDescription: [mockDescriptionFile],
        timeLimit: 1000,
        memoryLimit: 256000,
        testCases: mockAttachment,
        newTestCases: [mockTestCasesFile],
      },
    ],
    members: [
      {
        type: MemberType.CONTESTANT,
        name: "John Doe",
        login: "johndoe",
        password: "password123",
      },
    ],
  } as unknown as SettingsFormType;

  const validExistingFormData = {
    contest: {
      slug: "test-contest",
      title: "Test Contest",
      languages: {
        [SubmissionLanguage.CPP_17]: true,
        [SubmissionLanguage.JAVA_21]: false,
        [SubmissionLanguage.PYTHON_312]: false,
      },
      startAt: "2026-12-31T10:00",
      endAt: "2026-12-31T18:00",
      settings: {
        isAutoJudgeEnabled: true,
      },
    },
    problems: [
      {
        _id: "problem-1",
        title: "Problem A",
        description: mockAttachment,
        timeLimit: 1000,
        memoryLimit: 256000,
        testCases: mockAttachment,
      },
    ],
    members: [
      {
        _id: "member-1",
        type: MemberType.CONTESTANT,
        name: "John Doe",
        login: "johndoe",
        password: "",
      },
    ],
  } as unknown as SettingsFormType;

  describe("schema validation", () => {
    describe("contest validation", () => {
      it("should validate when all contest fields are valid", () => {
        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(validFormData);
        expect(error).toBeUndefined();
      });

      it("should fail validation when slug is missing", () => {
        const invalidData = {
          ...validFormData,
          contest: {
            ...validFormData.contest,
            slug: "",
          },
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["contest", "slug"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.slug-required",
        );
      });

      it("should fail validation when slug is too long", () => {
        const invalidData = {
          ...validFormData,
          contest: {
            ...validFormData.contest,
            slug: "a".repeat(33),
          },
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["contest", "slug"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.slug-too-long",
        );
      });

      it("should fail validation when slug has invalid characters", () => {
        const invalidData = {
          ...validFormData,
          contest: {
            ...validFormData.contest,
            slug: "test_contest!",
          },
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["contest", "slug"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.slug-pattern",
        );
      });

      it("should fail validation when title is missing", () => {
        const invalidData = {
          ...validFormData,
          contest: {
            ...validFormData.contest,
            title: "",
          },
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["contest", "title"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.title-required",
        );
      });

      it("should fail validation when title is too long", () => {
        const invalidData = {
          ...validFormData,
          contest: {
            ...validFormData.contest,
            title: "a".repeat(256),
          },
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["contest", "title"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.title-too-long",
        );
      });

      it("should fail validation when no languages are selected", () => {
        const invalidData = {
          ...validFormData,
          contest: {
            ...validFormData.contest,
            languages: {
              [SubmissionLanguage.CPP_17]: false,
              [SubmissionLanguage.JAVA_21]: false,
              [SubmissionLanguage.PYTHON_312]: false,
            },
          },
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["contest", "languages"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.languages-required",
        );
      });

      it("should fail validation when start date is in the past for NOT_STARTED contest", () => {
        const invalidData = {
          ...validFormData,
          contest: {
            ...validFormData.contest,
            startAt: "2020-01-01T10:00",
          },
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["contest", "startAt"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.start-future",
        );
      });

      it("should allow past start date for IN_PROGRESS contest", () => {
        const pastStartData = {
          ...validExistingFormData,
          contest: {
            ...validExistingFormData.contest,
            startAt: "2020-01-01T10:00",
            endAt: "2026-12-31T18:00",
          },
        };

        const { error } = SettingsForm.schema(
          ContestStatus.IN_PROGRESS,
        ).validate(pastStartData);
        expect(error).toBeUndefined();
      });

      it("should fail validation when end date is before start date", () => {
        const invalidData = {
          ...validFormData,
          contest: {
            ...validFormData.contest,
            startAt: "2026-12-31T18:00",
            endAt: "2026-12-31T10:00",
          },
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["contest", "endAt"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.end-after-start",
        );
      });

      describe("autoFreezeAt validation", () => {
        it("should validate when autoFreezeAt is valid", () => {
          const validData = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T10:00",
              endAt: "2026-12-31T18:00",
              autoFreezeAt: "2026-12-31T14:00",
            },
          };

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
          ).validate(validData);
          expect(error).toBeUndefined();
        });

        it("should validate when autoFreezeAt is not provided", () => {
          const dataWithoutAutoFreeze = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T10:00",
              endAt: "2026-12-31T18:00",
              // autoFreezeAt is optional, so omitting it
            },
          };
          delete dataWithoutAutoFreeze.contest.autoFreezeAt;

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
          ).validate(dataWithoutAutoFreeze);
          expect(error).toBeUndefined();
        });

        it("should fail validation when autoFreezeAt has invalid format", () => {
          const invalidData = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T10:00",
              endAt: "2026-12-31T18:00",
              autoFreezeAt: "invalid-date-format",
            },
          };

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
          ).validate(invalidData);
          expect(error).toBeDefined();
          expect(error?.details[0].path).toEqual(["contest", "autoFreezeAt"]);
          expect(error?.details[0].message).toBe(
            "app.[slug].(dashboard)._common.settings.settings-form.auto-freeze-invalid",
          );
        });

        it("should fail validation when autoFreezeAt is before start date", () => {
          const invalidData = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T14:00",
              endAt: "2026-12-31T18:00",
              autoFreezeAt: "2026-12-31T10:00", // Before start
            },
          };

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
          ).validate(invalidData);
          expect(error).toBeDefined();
          expect(error?.details[0].path).toEqual(["contest", "autoFreezeAt"]);
          expect(error?.details[0].message).toBe(
            "app.[slug].(dashboard)._common.settings.settings-form.auto-freeze-after-start",
          );
        });

        it("should fail validation when autoFreezeAt equals start date", () => {
          const invalidData = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T14:00",
              endAt: "2026-12-31T18:00",
              autoFreezeAt: "2026-12-31T14:00", // Same as start
            },
          };

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
          ).validate(invalidData);
          expect(error).toBeDefined();
          expect(error?.details[0].path).toEqual(["contest", "autoFreezeAt"]);
          expect(error?.details[0].message).toBe(
            "app.[slug].(dashboard)._common.settings.settings-form.auto-freeze-after-start",
          );
        });

        it("should fail validation when autoFreezeAt is after end date", () => {
          const invalidData = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T10:00",
              endAt: "2026-12-31T14:00",
              autoFreezeAt: "2026-12-31T18:00", // After end
            },
          };

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
          ).validate(invalidData);
          expect(error).toBeDefined();
          expect(error?.details[0].path).toEqual(["contest", "autoFreezeAt"]);
          expect(error?.details[0].message).toBe(
            "app.[slug].(dashboard)._common.settings.settings-form.auto-freeze-before-end",
          );
        });

        it("should fail validation when autoFreezeAt equals end date", () => {
          const invalidData = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T10:00",
              endAt: "2026-12-31T14:00",
              autoFreezeAt: "2026-12-31T14:00", // Same as end
            },
          };

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
          ).validate(invalidData);
          expect(error).toBeDefined();
          expect(error?.details[0].path).toEqual(["contest", "autoFreezeAt"]);
          expect(error?.details[0].message).toBe(
            "app.[slug].(dashboard)._common.settings.settings-form.auto-freeze-before-end",
          );
        });

        it("should validate when autoFreezeAt is exactly between start and end", () => {
          const validData = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T10:00",
              endAt: "2026-12-31T16:00",
              autoFreezeAt: "2026-12-31T13:00", // Exactly in the middle
            },
          };

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
          ).validate(validData);
          expect(error).toBeUndefined();
        });

        it("should validate when autoFreezeAt is one minute after start", () => {
          const validData = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T10:00",
              endAt: "2026-12-31T16:00",
              autoFreezeAt: "2026-12-31T10:01", // One minute after start
            },
          };

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
          ).validate(validData);
          expect(error).toBeUndefined();
        });

        it("should validate when autoFreezeAt is one minute before end", () => {
          const validData = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T10:00",
              endAt: "2026-12-31T16:00",
              autoFreezeAt: "2026-12-31T15:59", // One minute before end
            },
          };

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
          ).validate(validData);
          expect(error).toBeUndefined();
        });

        it("should skip validation when autoFreezeAt is unchanged from original", () => {
          const originalAutoFreeze = "2026-12-31T08:00"; // This would normally fail validation (before start)
          const dataWithUnchangedAutoFreeze = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T10:00",
              endAt: "2026-12-31T18:00",
              autoFreezeAt: originalAutoFreeze,
            },
          };

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
            originalAutoFreeze,
          ).validate(dataWithUnchangedAutoFreeze);
          expect(error).toBeUndefined();
        });

        it("should validate normally when autoFreezeAt is changed from original", () => {
          const originalAutoFreeze = "2026-12-31T14:00";
          const invalidData = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T10:00",
              endAt: "2026-12-31T18:00",
              autoFreezeAt: "2026-12-31T08:00", // Changed to invalid value
            },
          };

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
            originalAutoFreeze,
          ).validate(invalidData);
          expect(error).toBeDefined();
          expect(error?.details[0].path).toEqual(["contest", "autoFreezeAt"]);
          expect(error?.details[0].message).toBe(
            "app.[slug].(dashboard)._common.settings.settings-form.auto-freeze-after-start",
          );
        });

        it("should handle edge case with different date formats", () => {
          const invalidData = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T10:00",
              endAt: "2026-12-31T18:00",
              autoFreezeAt: "2026-12-31 14:00", // Wrong format (space instead of T)
            },
          };

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
          ).validate(invalidData);
          expect(error).toBeDefined();
          expect(error?.details[0].path).toEqual(["contest", "autoFreezeAt"]);
          expect(error?.details[0].message).toBe(
            "app.[slug].(dashboard)._common.settings.settings-form.auto-freeze-invalid",
          );
        });

        it("should handle edge case with missing seconds in format", () => {
          // The pattern requires HH:MM format without seconds
          const validData = {
            ...validFormData,
            contest: {
              ...validFormData.contest,
              startAt: "2026-12-31T10:00",
              endAt: "2026-12-31T18:00",
              autoFreezeAt: "2026-12-31T14:30", // Valid format without seconds
            },
          };

          const { error } = SettingsForm.schema(
            ContestStatus.NOT_STARTED,
          ).validate(validData);
          expect(error).toBeUndefined();
        });
      });
    });

    describe("problems validation", () => {
      it("should validate when problem fields are valid", () => {
        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(validFormData);
        expect(error).toBeUndefined();
      });

      it("should validate existing problem without new files", () => {
        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(validExistingFormData);
        expect(error).toBeUndefined();
      });

      it("should fail validation when new problem missing description file", () => {
        const invalidData = {
          ...validFormData,
          problems: [
            {
              title: "Problem A",
              description: mockAttachment,
              newDescription: [],
              timeLimit: 1000,
              memoryLimit: 256000,
              testCases: mockAttachment,
              newTestCases: [mockTestCasesFile],
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        // Note: We can't easily test the specific error path due to custom validation complexity
        expect(error?.details[0].message).toContain("required");
      });

      it("should fail validation when new problem missing test cases file", () => {
        const invalidData = {
          ...validFormData,
          problems: [
            {
              title: "Problem A",
              description: mockAttachment,
              newDescription: [mockDescriptionFile],
              timeLimit: 1000,
              memoryLimit: 256000,
              testCases: mockAttachment,
              newTestCases: [],
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        // Note: We can't easily test the specific error path due to custom validation complexity
        expect(error?.details[0].message).toContain("required");
      });

      it("should fail validation when problem title is missing", () => {
        const invalidData = {
          ...validExistingFormData,
          problems: [
            {
              ...validExistingFormData.problems[0],
              title: "",
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["problems", 0, "title"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.problem-title-required",
        );
      });

      it("should fail validation when problem title is too long", () => {
        const invalidData = {
          ...validExistingFormData,
          problems: [
            {
              ...validExistingFormData.problems[0],
              title: "a".repeat(256),
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["problems", 0, "title"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.problem-title-too-long",
        );
      });

      it("should fail validation when time limit is not positive", () => {
        const invalidData = {
          ...validExistingFormData,
          problems: [
            {
              ...validExistingFormData.problems[0],
              timeLimit: 0,
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["problems", 0, "timeLimit"]);
        expect(error?.details[0].message).toContain("greater than 0");
      });

      it("should fail validation when memory limit is not positive", () => {
        const invalidData = {
          ...validExistingFormData,
          problems: [
            {
              ...validExistingFormData.problems[0],
              memoryLimit: -1,
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["problems", 0, "memoryLimit"]);
        expect(error?.details[0].message).toContain("greater than 0");
      });
    });

    describe("members validation", () => {
      it("should validate when member fields are valid", () => {
        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(validFormData);
        expect(error).toBeUndefined();
      });

      it("should fail validation when member type is missing", () => {
        const invalidData = {
          ...validExistingFormData,
          members: [
            {
              ...validExistingFormData.members[0],
              type: "" as any,
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["members", 0, "type"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.member-type-required",
        );
      });

      it("should fail validation when member name is missing", () => {
        const invalidData = {
          ...validExistingFormData,
          members: [
            {
              ...validExistingFormData.members[0],
              name: "",
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["members", 0, "name"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.member-name-required",
        );
      });

      it("should fail validation when member name is too long", () => {
        const invalidData = {
          ...validExistingFormData,
          members: [
            {
              ...validExistingFormData.members[0],
              name: "a".repeat(65),
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["members", 0, "name"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.member-name-too-long",
        );
      });

      it("should fail validation when member login is missing", () => {
        const invalidData = {
          ...validExistingFormData,
          members: [
            {
              ...validExistingFormData.members[0],
              login: "",
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["members", 0, "login"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.member-login-required",
        );
      });

      it("should fail validation when member login is too long", () => {
        const invalidData = {
          ...validExistingFormData,
          members: [
            {
              ...validExistingFormData.members[0],
              login: "a".repeat(33),
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["members", 0, "login"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.member-login-too-long",
        );
      });

      it("should fail validation when password is missing for new member", () => {
        const invalidData = {
          ...validFormData,
          members: [
            {
              ...validFormData.members[0],
              password: "",
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["members", 0, "password"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.member-password-required",
        );
      });

      it("should allow empty password for existing member", () => {
        const validDataWithExistingMember = {
          ...validFormData,
          members: [
            {
              _id: "member-1",
              type: MemberType.CONTESTANT,
              name: "John Doe",
              login: "johndoe",
              password: "",
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(validDataWithExistingMember);
        expect(error).toBeUndefined();
      });

      it("should fail validation when password is too long", () => {
        const invalidData = {
          ...validExistingFormData,
          members: [
            {
              ...validExistingFormData.members[0],
              password: "a".repeat(33),
            },
          ],
        };

        const { error } = SettingsForm.schema(
          ContestStatus.NOT_STARTED,
        ).validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toEqual(["members", 0, "password"]);
        expect(error?.details[0].message).toBe(
          "app.[slug].(dashboard)._common.settings.settings-form.member-password-too-long",
        );
      });
    });
  });

  describe("toInputDTO", () => {
    it("should convert form data to input DTO", () => {
      const formDataForDTO = {
        ...validFormData,
        problems: [
          {
            title: "Problem A",
            description: mockAttachment,
            newDescription: [mockDescriptionFile],
            timeLimit: "1000",
            memoryLimit: "256000",
            testCases: mockAttachment,
            newTestCases: [mockTestCasesFile],
          },
        ],
      } as SettingsFormType;

      const dto = SettingsForm.toInputDTO(formDataForDTO);

      expect(dto.slug).toBe("test-contest");
      expect(dto.title).toBe("Test Contest");
      expect(dto.languages).toEqual([SubmissionLanguage.CPP_17]);
      expect(dto.settings).toEqual({ isAutoJudgeEnabled: true });
      expect(dto.startAt).toBeDefined();
      expect(dto.endAt).toBeDefined();
      expect(dto.members).toHaveLength(1);
      expect(dto.problems).toHaveLength(1);
      expect(dto.problems[0].title).toBe("Problem A");
    });

    it("should handle multiple selected languages", () => {
      const formDataWithMultipleLanguages = {
        ...validFormData,
        contest: {
          ...validFormData.contest,
          languages: {
            [SubmissionLanguage.CPP_17]: true,
            [SubmissionLanguage.JAVA_21]: true,
            [SubmissionLanguage.PYTHON_312]: false,
          },
        },
      } as unknown as SettingsFormType;

      const dto = SettingsForm.toInputDTO(formDataWithMultipleLanguages);

      expect(dto.languages).toEqual([
        SubmissionLanguage.CPP_17,
        SubmissionLanguage.JAVA_21,
      ]);
    });

    it("should handle existing member with empty password", () => {
      const formDataWithExistingMember = {
        ...validFormData,
        members: [
          {
            _id: "member-1",
            type: MemberType.CONTESTANT,
            name: "John Doe",
            login: "johndoe",
            password: "",
          },
        ],
      } as unknown as SettingsFormType;

      const dto = SettingsForm.toInputDTO(formDataWithExistingMember);

      expect(dto.members[0].password).toBeUndefined();
    });

    it("should assign letters to problems in order", () => {
      const formDataWithMultipleProblems = {
        ...validFormData,
        problems: [
          {
            title: "Problem 1",
            description: mockAttachment,
            newDescription: [mockDescriptionFile],
            timeLimit: "1000",
            memoryLimit: "256000",
            testCases: mockAttachment,
            newTestCases: [mockTestCasesFile],
          },
          {
            title: "Problem 2",
            description: mockAttachment,
            newDescription: [mockDescriptionFile],
            timeLimit: "2000",
            memoryLimit: "512000",
            testCases: mockAttachment,
            newTestCases: [mockTestCasesFile],
          },
        ],
      } as unknown as SettingsFormType;

      const dto = SettingsForm.toInputDTO(formDataWithMultipleProblems);

      expect(dto.problems[0].letter).toBe("A");
      expect(dto.problems[1].letter).toBe("B");
    });
  });

  describe("parseFiles", () => {
    it("should return first file when files array has content", () => {
      const mockFile = { name: "test.txt", type: "text/plain" };
      const files = [mockFile];

      const result = SettingsForm.parseFiles(files as any);

      expect(result).toBe(mockFile);
    });

    it("should return undefined when files array is empty", () => {
      const result = SettingsForm.parseFiles([]);

      expect(result).toBeUndefined();
    });

    it("should return undefined when files is undefined", () => {
      const result = SettingsForm.parseFiles(undefined);

      expect(result).toBeUndefined();
    });
  });

  describe("fromResponseDTO", () => {
    const mockContestResponse = MockContestFullResponseDTO({
      id: "contest-1",
      slug: "test-contest",
      title: "Test Contest",
      languages: [SubmissionLanguage.CPP_17, SubmissionLanguage.JAVA_21],
      startAt: "2026-12-31T10:00:00Z",
      endAt: "2026-12-31T18:00:00Z",
      settings: {
        isAutoJudgeEnabled: true,
      },
      problems: [
        {
          id: "problem-1",
          letter: "A",
          title: "Problem A",
          description: mockAttachment,
          timeLimit: 1000,
          memoryLimit: 256000,
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
      ],
    });

    it("should convert contest response to form data", () => {
      const formData = SettingsForm.fromResponseDTO(mockContestResponse);

      expect(formData.contest.slug).toBe("test-contest");
      expect(formData.contest.title).toBe("Test Contest");
      expect(formData.contest.languages[SubmissionLanguage.CPP_17]).toBe(true);
      expect(formData.contest.languages[SubmissionLanguage.JAVA_21]).toBe(true);
      expect(formData.contest.languages[SubmissionLanguage.PYTHON_312]).toBe(
        false,
      );
      expect(formData.contest.settings).toEqual({ isAutoJudgeEnabled: true });
    });

    it("should convert problems correctly", () => {
      const formData = SettingsForm.fromResponseDTO(mockContestResponse);

      expect(formData.problems).toHaveLength(1);
      expect(formData.problems[0]).toEqual({
        _id: "problem-1",
        letter: "A",
        title: "Problem A",
        description: mockAttachment,
        newDescription: [],
        timeLimit: "1000",
        memoryLimit: "256000",
        testCases: mockAttachment,
        newTestCases: [],
      });
    });

    it("should convert members correctly", () => {
      const formData = SettingsForm.fromResponseDTO(mockContestResponse);

      expect(formData.members).toHaveLength(1);
      expect(formData.members[0]).toEqual({
        _id: "member-1",
        type: MemberType.CONTESTANT,
        name: "John Doe",
        login: "johndoe",
        password: undefined,
      });
    });
  });

  describe("messages", () => {
    it("should have all required message definitions", () => {
      expect(SettingsForm.messages.slugRequired).toBeDefined();
      expect(SettingsForm.messages.slugTooLong).toBeDefined();
      expect(SettingsForm.messages.slugPattern).toBeDefined();
      expect(SettingsForm.messages.titleRequired).toBeDefined();
      expect(SettingsForm.messages.titleTooLong).toBeDefined();
      expect(SettingsForm.messages.languagesRequired).toBeDefined();
      expect(SettingsForm.messages.startRequired).toBeDefined();
      expect(SettingsForm.messages.startFuture).toBeDefined();
      expect(SettingsForm.messages.endRequired).toBeDefined();
      expect(SettingsForm.messages.endAfterStart).toBeDefined();
      expect(SettingsForm.messages.problemTitleRequired).toBeDefined();
      expect(SettingsForm.messages.problemTitleTooLong).toBeDefined();
      expect(SettingsForm.messages.problemDescriptionRequired).toBeDefined();
      expect(SettingsForm.messages.problemDescriptionSize).toBeDefined();
      expect(SettingsForm.messages.problemTimeLimitRequired).toBeDefined();
      expect(SettingsForm.messages.problemTimeLimitPositive).toBeDefined();
      expect(SettingsForm.messages.problemMemoryLimitRequired).toBeDefined();
      expect(SettingsForm.messages.problemMemoryLimitPositive).toBeDefined();
      expect(SettingsForm.messages.problemTestCasesRequired).toBeDefined();
      expect(SettingsForm.messages.problemTestCasesSize).toBeDefined();
      expect(SettingsForm.messages.problemTestCasesFormat).toBeDefined();
      expect(SettingsForm.messages.memberTypeRequired).toBeDefined();
      expect(SettingsForm.messages.memberNameRequired).toBeDefined();
      expect(SettingsForm.messages.memberNameTooLong).toBeDefined();
      expect(SettingsForm.messages.memberLoginRequired).toBeDefined();
      expect(SettingsForm.messages.memberLoginTooLong).toBeDefined();
      expect(SettingsForm.messages.memberPasswordRequired).toBeDefined();
      expect(SettingsForm.messages.memberPasswordTooLong).toBeDefined();
    });

    it("should have correct message IDs", () => {
      expect(SettingsForm.messages.slugRequired.id).toBe(
        "app.[slug].(dashboard)._common.settings.settings-form.slug-required",
      );
      expect(SettingsForm.messages.titleRequired.id).toBe(
        "app.[slug].(dashboard)._common.settings.settings-form.title-required",
      );
      expect(SettingsForm.messages.languagesRequired.id).toBe(
        "app.[slug].(dashboard)._common.settings.settings-form.languages-required",
      );
      expect(SettingsForm.messages.memberPasswordRequired.id).toBe(
        "app.[slug].(dashboard)._common.settings.settings-form.member-password-required",
      );
    });
  });
});
