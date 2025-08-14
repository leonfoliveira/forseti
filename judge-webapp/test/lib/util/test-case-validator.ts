import { TestCaseValidator } from "@/lib/util/test-case-validator";

describe("TestCaseValidator", () => {
  it("should validate problems without new test cases", async () => {
    const problems = [
      { letter: "A", newTestCases: undefined },
      { letter: "B", newTestCases: undefined },
    ] as any;
    const result = await TestCaseValidator.validateProblemList(problems);
    expect(result).toEqual([]);
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
    expect(result).toEqual(["A"]);
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
    expect(result).toEqual(["A"]);
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
    expect(result).toEqual([]);
  });
});
