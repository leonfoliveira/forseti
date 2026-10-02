import Papa from "papaparse";

import { TestCaseValidator } from "@/app/_lib/util/TestCaseValidator";

describe("TestCaseValidator", () => {
  it("rejects rows that do not contain exactly two columns", async () => {
    const parse = jest.spyOn(Papa, "parse").mockImplementation((_file, config) => {
      if (!config) throw new Error("Expected parse options");
      config.complete?.(
        { data: [["input", "output", "extra"]], errors: [], meta: {} as never },
        _file as never,
      );
      return undefined as never;
    });
    await expect(TestCaseValidator.validate(new File(["csv"], "cases.csv"))).resolves.toBe(false);
    parse.mockRestore();
  });
});
