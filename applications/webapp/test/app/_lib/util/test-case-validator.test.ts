import { TestCaseValidator } from "@/app/_lib/util/test-case-validator";

jest.mock("papaparse", () => ({
  parse: jest.fn(),
}));

describe("TestCaseValidator", () => {
  const mockFile = new File(["test content"], "test.csv", { type: "text/csv" });
  let mockParse: jest.MockedFunction<any>;

  beforeEach(() => {
    mockParse = require("papaparse").parse;
    jest.clearAllMocks();
  });

  it("should return true for valid CSV with two columns", async () => {
    mockParse.mockImplementation((file: File, options: any) => {
      options.complete({
        data: [
          ["input1", "output1"],
          ["input2", "output2"],
          ["input3", "output3"],
        ],
        errors: [],
      });
    });

    const result = await TestCaseValidator.validate(mockFile);
    expect(result).toBe(true);
    expect(mockParse).toHaveBeenCalledWith(mockFile, expect.any(Object));
  });

  it("should return false for CSV with parsing errors", async () => {
    mockParse.mockImplementation((file: File, options: any) => {
      options.complete({
        data: [["input1", "output1"]],
        errors: [{ message: "Parse error" }],
      });
    });

    const result = await TestCaseValidator.validate(mockFile);
    expect(result).toBe(false);
  });

  it("should return false for empty CSV", async () => {
    mockParse.mockImplementation((file: File, options: any) => {
      options.complete({
        data: [],
        errors: [],
      });
    });

    const result = await TestCaseValidator.validate(mockFile);
    expect(result).toBe(false);
  });

  it("should return false for CSV with wrong number of columns", async () => {
    mockParse.mockImplementation((file: File, options: any) => {
      options.complete({
        data: [
          ["input1", "output1"],
          ["input2"], // Missing column
          ["input3", "output3"],
        ],
        errors: [],
      });
    });

    const result = await TestCaseValidator.validate(mockFile);
    expect(result).toBe(false);
  });

  it("should return false for CSV with too many columns", async () => {
    mockParse.mockImplementation((file: File, options: any) => {
      options.complete({
        data: [
          ["input1", "output1"],
          ["input2", "output2", "extra"], // Extra column
          ["input3", "output3"],
        ],
        errors: [],
      });
    });

    const result = await TestCaseValidator.validate(mockFile);
    expect(result).toBe(false);
  });

  it("should return false for single row with wrong columns", async () => {
    mockParse.mockImplementation((file: File, options: any) => {
      options.complete({
        data: [["single-value"]],
        errors: [],
      });
    });

    const result = await TestCaseValidator.validate(mockFile);
    expect(result).toBe(false);
  });

  it("should return false when parse throws error", async () => {
    mockParse.mockImplementation((file: File, options: any) => {
      options.error();
    });

    const result = await TestCaseValidator.validate(mockFile);
    expect(result).toBe(false);
  });

  it("should handle mixed valid and invalid rows", async () => {
    mockParse.mockImplementation((file: File, options: any) => {
      options.complete({
        data: [
          ["input1", "output1"], // Valid
          ["input2", "output2", "extra"], // Invalid - too many columns
        ],
        errors: [],
      });
    });

    const result = await TestCaseValidator.validate(mockFile);
    expect(result).toBe(false);
  });

  it("should validate all rows even if first ones are valid", async () => {
    mockParse.mockImplementation((file: File, options: any) => {
      options.complete({
        data: [
          ["input1", "output1"], // Valid
          ["input2", "output2"], // Valid
          ["input3"], // Invalid - missing column
        ],
        errors: [],
      });
    });

    const result = await TestCaseValidator.validate(mockFile);
    expect(result).toBe(false);
  });
});
