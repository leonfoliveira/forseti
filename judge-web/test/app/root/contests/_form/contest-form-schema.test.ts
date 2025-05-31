import { contestFormSchema } from "@/app/root/contests/_form/contest-form-schema";

const now = new Date();
const futureDate = new Date(now.getTime() + 60 * 60 * 1000);
const laterDate = new Date(futureDate.getTime() + 60 * 60 * 1000);

const baseValidData = {
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
      title: "Problem 1",
      newDescription: "Some description",
      timeLimit: 1,
      newTestCases: [],
    },
  ],
};

describe("contestFormSchema", () => {
  test("valid data passes", () => {
    const { error } = contestFormSchema.validate(baseValidData);
    expect(error).toBeUndefined();
  });

  // Title
  test("missing title fails", () => {
    const { error } = contestFormSchema.validate({
      ...baseValidData,
      title: "",
    });
    expect(error?.details[0].message).toBe("Title is required");
  });

  // Languages
  test("missing languages fails", () => {
    const { error } = contestFormSchema.validate({
      ...baseValidData,
      languages: [],
    });
    expect(error?.details[0].message).toBe("At least one language is required");
  });

  // startAt
  test("startAt in the past fails", () => {
    const past = new Date(Date.now() - 1000);
    const { error } = contestFormSchema.validate({
      ...baseValidData,
      startAt: past,
    });
    expect(error?.details[0].message).toBe("Start at must be in the future");
  });

  // endAt
  test("endAt before startAt fails", () => {
    const invalidEnd = new Date(futureDate.getTime() - 1000);
    const { error } = contestFormSchema.validate({
      ...baseValidData,
      endAt: invalidEnd,
    });
    expect(error?.details[0].message).toBe("End at must be after start at");
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
    expect(error?.details[0].message).toBe("Type is required");
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
    expect(error?.details[0].message).toBe("Password is required");
  });

  test("member with _id can omit password", () => {
    const data = {
      ...baseValidData,
      members: [
        {
          _id: 1,
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
    expect(error?.details[0].message).toBe("Title is required");
  });

  test("problem missing timeLimit fails", () => {
    const { ...rest } = baseValidData.problems[0];
    const data = {
      ...baseValidData,
      problems: [{ ...rest, timeLimit: undefined }],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("Time limit is required");
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
    expect(error?.details[0].message).toBe("Time limit must be greater than 0");
  });

  test("problem with description allows optional newDescription", () => {
    const data = {
      ...baseValidData,
      problems: [
        {
          description: "old desc",
          timeLimit: 1,
          title: "Problem",
          newTestCases: [],
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
          title: "Problem",
          timeLimit: 1,
          newTestCases: [],
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("Description is required");
  });

  test("problem missing newTestCases and testCases fails", () => {
    const data = {
      ...baseValidData,
      problems: [
        {
          title: "Problem",
          newDescription: "desc",
          timeLimit: 1,
        },
      ],
    };
    const { error } = contestFormSchema.validate(data);
    expect(error?.details[0].message).toBe("Test cases are required");
  });

  test("problem with testCases allows optional newTestCases", () => {
    const data = {
      ...baseValidData,
      problems: [
        {
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
});
