import { contestFormSchema } from "@/app/root/(dashboard)/contests/_form/contest-form-schema";
import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";

describe("contestFormSchema", () => {
  const validData = {
    slug: "test-contest",
    title: "Test Contest",
    languages: [Language.PYTHON_3_13],
    startAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
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
        title: "Problem 1",
        newDescription: new File(["description"], "description.pdf", {
          type: "application/pdf",
        }),
        timeLimit: 1000,
        memoryLimit: 256,
        newTestCases: new File(["newTestCases"], "testCases.csv", {
          type: "text/csv",
        }),
      },
    ],
  };

  it("should validate valid data", () => {
    expect(contestFormSchema.validate(validData).error).toBeUndefined();
  });

  it("should validate slug", () => {
    expect(
      contestFormSchema.validate({ ...validData, slug: undefined }).error
        ?.message,
    ).toBe("app.root.(dashboard)._form.contest-form-schema.slug-required");
    expect(
      contestFormSchema.validate({ ...validData, slug: "" }).error?.message,
    ).toBe("app.root.(dashboard)._form.contest-form-schema.slug-required");
    expect(
      contestFormSchema.validate({
        ...validData,
        slug: "with space#!",
      }).error?.message,
    ).toBe("app.root.(dashboard)._form.contest-form-schema.slug-pattern");
  });

  it("should validate title", () => {
    expect(
      contestFormSchema.validate({ ...validData, title: undefined }).error
        ?.message,
    ).toBe("app.root.(dashboard)._form.contest-form-schema.title-required");
    expect(
      contestFormSchema.validate({ ...validData, title: "" }).error?.message,
    ).toBe("app.root.(dashboard)._form.contest-form-schema.title-required");
  });

  it("should validate languages", () => {
    expect(
      contestFormSchema.validate({ ...validData, languages: undefined }).error
        ?.message,
    ).toBe("app.root.(dashboard)._form.contest-form-schema.languages-required");
    expect(
      contestFormSchema.validate({ ...validData, languages: [] }).error
        ?.message,
    ).toBe("app.root.(dashboard)._form.contest-form-schema.languages-required");
  });

  it("should validate startAt", () => {
    expect(
      contestFormSchema.validate({ ...validData, startAt: undefined }).error
        ?.message,
    ).toBe("app.root.(dashboard)._form.contest-form-schema.start-at-required");
    expect(
      contestFormSchema.validate({
        ...validData,
        startAt: new Date(Date.now() - 1000 * 60 * 60),
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.start-at-greater-now",
    );
    expect(
      contestFormSchema.validate({
        ...validData,
        originalStartAt: new Date(Date.now() + 1000 * 60 * 60),
        startAt: undefined,
      }).error?.message,
    ).toBe("app.root.(dashboard)._form.contest-form-schema.start-at-required");
    expect(
      contestFormSchema.validate({
        ...validData,
        originalStartAt: new Date(Date.now() + 1000 * 60 * 60),
        startAt: new Date(Date.now() - 1000 * 60 * 60),
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.start-at-greater-now",
    );
  });

  it("should validate endAt", () => {
    expect(
      contestFormSchema.validate({ ...validData, endAt: undefined }).error
        ?.message,
    ).toBe("app.root.(dashboard)._form.contest-form-schema.end-at-required");
    expect(
      contestFormSchema.validate({
        ...validData,
        endAt: new Date(Date.now() - 1000 * 60 * 60),
      }).error?.message,
    ).toBe("app.root.(dashboard)._form.contest-form-schema.end-at-greater-now");
  });

  it("should validate members", () => {
    expect(
      contestFormSchema.validate({ ...validData, members: undefined }).error
        ?.message,
    ).not.toBeUndefined();
  });

  it("should validate member.type", () => {
    expect(
      contestFormSchema.validate({
        ...validData,
        members: [{ type: undefined }],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.member-type-required",
    );
    expect(
      contestFormSchema.validate({
        ...validData,
        members: [{ type: "" }],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.member-type-required",
    );
  });

  it("should validate member.name", () => {
    expect(
      contestFormSchema.validate({
        ...validData,
        members: [{ ...validData.members[0], name: undefined }],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.member-name-required",
    );
    expect(
      contestFormSchema.validate({
        ...validData,
        members: [{ ...validData.members[0], name: "" }],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.member-name-required",
    );
  });

  it("should validate member.login", () => {
    expect(
      contestFormSchema.validate({
        ...validData,
        members: [{ ...validData.members[0], login: undefined }],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.member-login-required",
    );
    expect(
      contestFormSchema.validate({
        ...validData,
        members: [{ ...validData.members[0], login: "" }],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.member-login-required",
    );
  });

  it("should validate member.password", () => {
    expect(
      contestFormSchema.validate({
        ...validData,
        members: [
          { ...validData.members[0], _id: undefined, password: undefined },
        ],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.member-password-required",
    );
    expect(
      contestFormSchema.validate({
        ...validData,
        members: [{ ...validData.members[0], _id: undefined, password: "" }],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.member-password-required",
    );
  });

  it("should validate problems", () => {
    expect(
      contestFormSchema.validate({ ...validData, problems: undefined }).error
        ?.message,
    ).not.toBeUndefined();
  });

  it("should validate problem.title", () => {
    expect(
      contestFormSchema.validate({
        ...validData,
        problems: [{ ...validData.problems[0], title: undefined }],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.problem-title-required",
    );
    expect(
      contestFormSchema.validate({
        ...validData,
        problems: [{ ...validData.problems[0], title: "" }],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.problem-title-required",
    );
  });

  it("should validate problem.newDescription", () => {
    expect(
      contestFormSchema.validate({
        ...validData,
        problems: [
          {
            ...validData.problems[0],
            _id: undefined,
            newDescription: undefined,
          },
        ],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.problem-description-required",
    );
  });

  it("should validate problem.timeLimit", () => {
    expect(
      contestFormSchema.validate({
        ...validData,
        problems: [{ ...validData.problems[0], timeLimit: undefined }],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.problem-time-limit-required",
    );
    expect(
      contestFormSchema.validate({
        ...validData,
        problems: [{ ...validData.problems[0], timeLimit: 0 }],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.problem-time-limit-min",
    );
  });

  it("should validate problem.memoryLimit", () => {
    expect(
      contestFormSchema.validate({
        ...validData,
        problems: [{ ...validData.problems[0], memoryLimit: undefined }],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.problem-memory-limit-required",
    );
    expect(
      contestFormSchema.validate({
        ...validData,
        problems: [{ ...validData.problems[0], memoryLimit: 0 }],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.problem-memory-limit-min",
    );
  });

  it("should validate problem.newTestCases", () => {
    expect(
      contestFormSchema.validate({
        ...validData,
        problems: [
          { ...validData.problems[0], _id: undefined, newTestCases: undefined },
        ],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.problem-test-cases-required",
    );
    expect(
      contestFormSchema.validate({
        ...validData,
        problems: [
          {
            ...validData.problems[0],
            _id: undefined,
            newTestCases: new File(["testCases"], "testCases.txt", {
              type: "plain/text",
            }),
          },
        ],
      }).error?.message,
    ).toBe(
      "app.root.(dashboard)._form.contest-form-schema.problem-test-cases-content-type",
    );
  });
});
