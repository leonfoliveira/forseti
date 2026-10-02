import Papa from "papaparse";

import { MemberLoader } from "@/app/_lib/util/MemberLoader";
import { MemberType } from "@/domain/enumerate/MemberType";

describe("MemberLoader", () => {
  it("maps CSV rows and blanks missing or unsupported values", async () => {
    const parse = jest.spyOn(Papa, "parse").mockImplementation((_file, config) => {
      if (!config) throw new Error("Expected parse options");
      config.complete?.(
        {
          data: [["Ada", MemberType.CONTESTANT, "ada", "pw"], ["Invalid", MemberType.ROOT, "", ""]],
          errors: [],
          meta: {} as never,
        },
        _file as never,
      );
      return undefined as never;
    });
    await expect(MemberLoader.loadFromCsv(new File(["csv"], "members.csv"))).resolves.toEqual([
      { name: "Ada", type: MemberType.CONTESTANT, login: "ada", password: "pw" },
      { name: "Invalid", type: "", login: "", password: "" },
    ]);
    parse.mockRestore();
  });
});
