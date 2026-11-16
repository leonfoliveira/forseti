import Papa, { parse } from "papaparse";

import { TestCaseValidator } from "@/app/_lib/util/TestCaseValidator";

describe("TestCaseValidator", () => {
  it("rejects on parse errors", async () => {
    const parse = jest
      .spyOn(Papa, "parse")
      .mockImplementation((_file, config) => {
        (config as any).error?.(new Error("Parse error"), _file as never);
        return undefined as never;
      });

    const file = new File(["csv"], "cases.csv");
    await expect(TestCaseValidator.validate(file)).resolves.toBe(false);
    parse.mockRestore();
  });

  it("rejects on parse complete with errors", async () => {
    const parse = jest
      .spyOn(Papa, "parse")
      .mockImplementation((_file, config) => {
        (config as any).complete?.(
          {
            data: [],
            errors: [new Error("Parse complete error")],
            meta: {} as never,
          },
          _file as never,
        );
        return undefined as never;
      });

    const file = new File(["csv"], "cases.csv");
    await expect(TestCaseValidator.validate(file)).resolves.toBe(false);
    parse.mockRestore();
  });

  it("rejects empty CSV files", async () => {
    const data = "";
    const file = new File([data], "cases.csv");

    await expect(TestCaseValidator.validate(file)).resolves.toBe(false);
  });

  it("rejects CSV files without two columns", async () => {
    const data = "input\noutput";
    const file = new File([data], "cases.csv");

    await expect(TestCaseValidator.validate(file)).resolves.toBe(false);
  });

  it("accepts valid CSV files with exactly two columns", async () => {
    const data = "input,output\n1,2";
    const file = new File([data], "cases.csv");

    await expect(TestCaseValidator.validate(file)).resolves.toBe(true);
  });
});
