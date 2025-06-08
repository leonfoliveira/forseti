import { contestFormSchema } from "@/app/root/contests/_form/contest-form-schema";

const now = new Date();
const futureDate = new Date(now.getTime() + 60 * 60 * 1000);
const laterDate = new Date(futureDate.getTime() + 60 * 60 * 1000);

const baseValidData = {
  slug: "slug",
  title: "Contest Title",
  languages: ["javascript"],
  startAt: futureDate,
  endAt: laterDate,
  members: [
    {
      type: "user",
      name: "Alice",
      login: "alice123",
      password: "secretpass",
    },
  ],
  problems: [
    {
      letter: "A",
      title: "Problem 1",
      newDescription: {
        size: 1024,
        type: "application/pdf",
      },
      timeLimit: 1,
      newTestCases: {
        size: 1024,
        type: "text/csv",
      },
    },
  ],
};

describe("contestFormSchema", () => {
  test("valid data passes", () => {
    const { error } = contestFormSchema.validate(baseValidData);
    expect(error).toBeUndefined();
  });

  // Title
  test("missing slug fails", () => {
    const { error } = contestFormSchema.validate({
      ...baseValidData,
      slug: "",
    });
    expect(error?.details[0].message).toBe("slug.required");
  });

  // Title
  test("non-alphanumeric slug fails", () => {
    const { error } = contestFormSchema.validate({
      ...baseValidData,
      slug: "not alpha",
    });
    expect(error?.details[0].message).toBe("slug.alphanum");
  });

  // Title
  test("missing title fails", () => {
    const { error } = contestFormSchema.validate({
      ...baseValidData,
      title: "",
    });
    expect(error?.details[0].message).toBe("title.required");
  });

  // Languages
  test("missing languages fails", () => {
    const { error } = contestFormSchema.validate({
      ...baseValidData,
      languages: [],
    });
    expect(error?.details[0].message).toBe("languages.required");
  });

  // startAt
  test("startAt in the past fails", () => {
    const past = new Date(Date.now() - 1000);
    const { error } = contestFormSchema.validate({
      ...baseValidData,
      startAt: past,
    });
    expect(error?.details[0].message).toBe("start-at.greater");
  });

  // endAt
  test("endAt before startAt fails", () => {
    const invalidEnd = new Date(futureDate.getTime() - 1000);
    const { error } = contestFormSchema.validate({
      ...baseValidData,
      endAt: invalidEnd,
    });
    expect(error?.details[0].message).toBe("end-at.greater");
  });

  // Members
  test("member missing type fails", () => {
    const data = {
      ...baseValidData,
      members: [
        {
          name: "Test",
          login: "login",
          password: "pass",
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("member-type.required");
  });

  test("member missing password fails if no _id", () => {
    const data = {
      ...baseValidData,
      members: [
        {
          type: "user",
          name: "Test",
          login: "login",
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("member-password.required");
  });

  test("member with _id can omit password", () => {
    const data = {
      ...baseValidData,
      members: [
        {
          _id: "1",
          type: "user",
          name: "Test",
          login: "login",
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error).toBeUndefined();
  });

  // Problems
  test("problem missing letter fails", () => {
    const data = {
      ...baseValidData,
      problems: [
        {
          ...baseValidData.problems[0],
          letter: "",
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("problem-letter.required");
  });

  // Problems
  test("problem letter many characters fails", () => {
    const data = {
      ...baseValidData,
      problems: [
        {
          ...baseValidData.problems[0],
          letter: "AB",
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("problem-letter.length");
  });

  // Problems
  test("problem missing title fails", () => {
    const data = {
      ...baseValidData,
      problems: [
        {
          ...baseValidData.problems[0],
          title: "",
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("problem-title.required");
  });

  test("problem missing timeLimit fails", () => {
    const { ...rest } = baseValidData.problems[0];
    const data = {
      ...baseValidData,
      problems: [{ ...rest, timeLimit: undefined }],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("problem-time-limit.required");
  });

  test("problem with timeLimit = 0 fails", () => {
    const data = {
      ...baseValidData,
      problems: [
        {
          ...baseValidData.problems[0],
          timeLimit: 0,
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("problem-time-limit.min");
  });

  test("problem with description allows optional newDescription", () => {
    const data = {
      ...baseValidData,
      problems: [
        {
          letter: "A",
          description: "old desc",
          timeLimit: 1,
          title: "Problem",
          newTestCases: {
            size: 1024,
            type: "text/csv",
          },
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error).toBeUndefined();
  });

  test("problem missing newDescription and description fails", () => {
    const data = {
      ...baseValidData,
      problems: [
        {
          letter: "A",
          title: "Problem",
          timeLimit: 1,
          newTestCases: {},
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("problem-description.required");
  });

  test("problem with newDescription file too large fails", () => {
    const data = {
      ...baseValidData,
      problems: [
        {
          letter: "A",
          title: "Problem",
          newDescription: {
            size: 10 * 1024 * 1024 + 1,
            contentType: "application/pdf",
          },
          timeLimit: 1,
          newTestCases: {},
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("problem-description.size");
  });

  test("problem missing newTestCases and testCases fails", () => {
    const data = {
      ...baseValidData,
      problems: [
        {
          letter: "A",
          title: "Problem",
          description: {},
          timeLimit: 1,
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("problem-test-cases.required");
  });

  test("problem with testCases allows optional newTestCases", () => {
    const data = {
      ...baseValidData,
      problems: [
        {
          letter: "A",
          title: "Problem",
          description: "Old desc",
          testCases: [],
          timeLimit: 1,
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error).toBeUndefined();
  });

  test("problem with testCases file too large fails", () => {
    const data = {
      ...baseValidData,
      problems: [
        {
          letter: "A",
          title: "Problem",
          description: {},
          timeLimit: 1,
          newTestCases: { size: 10 * 1024 * 1024 + 1, contentType: "text/csv" },
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("problem-test-cases.size");
  });
});
