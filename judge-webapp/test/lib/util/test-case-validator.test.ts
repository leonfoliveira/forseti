import { TestCaseValidator } from "@/lib/util/test-case-validator";

describe("TestCaseValidator", () => {
  it("should validate problems without new test cases", async () => {
    const problems = [
      { letter: "A", newTestCases: undefined },
      { letter: "B", newTestCases: undefined },
    ] as any;
    const result = await TestCaseValidator.validateProblemList(problems);
    expect(result).toHaveLength(2);
    expect(result[0].problem.letter).toBe("A");
    expect(result[0].isValid).toBe(true);
    expect(result[1].problem.letter).toBe("B");
    expect(result[1].isValid).toBe(true);
  });

  it("should invalidate problem with empty testcases", async () => {
    const problems = [
      {
        letter: "A",
        newTestCases: new File([""], "test.csv", {
          type: "text/csv",
        }),
      },
      { letter: "B", newTestCases: undefined },
    ] as any;
    const result = await TestCaseValidator.validateProblemList(problems);
    expect(result).toHaveLength(2);
    expect(result[0].problem.letter).toBe("A");
    expect(result[0].isValid).toBe(false);
    expect(result[1].problem.letter).toBe("B");
    expect(result[1].isValid).toBe(true);
  });

  it("should invalidate problem test cases without exactly two columns", async () => {
    const problems = [
      {
        letter: "A",
        newTestCases: new File(["input1,output1\ninput2"], "test.csv", {
          type: "text/csv",
        }),
      },
      { letter: "B", newTestCases: undefined },
    ] as any;
    const result = await TestCaseValidator.validateProblemList(problems);
    expect(result).toHaveLength(2);
    expect(result[0].problem.letter).toBe("A");
    expect(result[0].isValid).toBe(false);
    expect(result[1].problem.letter).toBe("B");
    expect(result[1].isValid).toBe(true);
  });

  it("should validate problem with valid test cases", async () => {
    const problems = [
      {
        letter: "A",
        newTestCases: new File(["input1,output1\ninput2,output2"], "test.csv", {
          type: "text/csv",
        }),
      },
      { letter: "B", newTestCases: undefined },
    ] as any;
    const result = await TestCaseValidator.validateProblemList(problems);
    expect(result).toHaveLength(2);
    expect(result[0].problem.letter).toBe("A");
    expect(result[0].isValid).toBe(true);
    expect(result[1].problem.letter).toBe("B");
    expect(result[1].isValid).toBe(true);
  });

  it("should handle multiple problems with mixed validation results", async () => {
    const problems = [
      {
        letter: "A",
        newTestCases: new File(["input1,output1\ninput2,output2"], "test.csv", {
          type: "text/csv",
        }),
      },
      {
        letter: "B",
        newTestCases: new File(["input1"], "test.csv", {
          type: "text/csv",
        }),
      },
      { letter: "C", newTestCases: undefined },
    ] as any;
    const result = await TestCaseValidator.validateProblemList(problems);
    expect(result).toHaveLength(3);

    const resultA = result.find((r) => r.problem.letter === "A");
    const resultB = result.find((r) => r.problem.letter === "B");
    const resultC = result.find((r) => r.problem.letter === "C");

    expect(resultA?.isValid).toBe(true);
    expect(resultB?.isValid).toBe(false);
    expect(resultC?.isValid).toBe(true);
  });

  it("should validate problems with null or undefined newTestCases", async () => {
    const problems = [
      { letter: "A", newTestCases: null },
      { letter: "B", newTestCases: undefined },
    ] as any;
    const result = await TestCaseValidator.validateProblemList(problems);
    expect(result).toHaveLength(2);
    expect(result[0].problem.letter).toBe("A");
    expect(result[0].isValid).toBe(true);
    expect(result[1].problem.letter).toBe("B");
    expect(result[1].isValid).toBe(true);
  });

  it("should invalidate problem with malformed CSV", async () => {
    const problems = [
      {
        letter: "A",
        newTestCases: new File(["input1,output1,extra\ninput2,output2"], "test.csv", {
          type: "text/csv",
        }),
      },
    ] as any;
    const result = await TestCaseValidator.validateProblemList(problems);
    expect(result).toHaveLength(1);
    expect(result[0].problem.letter).toBe("A");
    expect(result[0].isValid).toBe(false);
  });
});
