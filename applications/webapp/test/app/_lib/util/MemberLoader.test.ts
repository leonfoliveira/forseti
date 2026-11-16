import Papa from "papaparse";

import { MemberLoader } from "@/app/_lib/util/MemberLoader";
import { MemberType } from "@/domain/enumerate/MemberType";

describe("MemberLoader", () => {
  it("rejects on parse errors", async () => {
    const parse = jest
      .spyOn(Papa, "parse")
      .mockImplementation((_file, config) => {
        (config as any).error?.(new Error("Parse error"), _file as never);
        return undefined as never;
      });

    const file = new File(["csv"], "members.csv");
    await expect(MemberLoader.loadFromCsv(file)).rejects.toThrow();
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

    const file = new File(["csv"], "members.csv");
    await expect(MemberLoader.loadFromCsv(file)).rejects.toThrow();
    parse.mockRestore();
  });

  it("loads with default values for missing fields", async () => {
    const data = ",,,,\n";
    const file = new File([data], "members.csv");
    const members = await MemberLoader.loadFromCsv(file);
    expect(members).toEqual([
      {
        name: "",
        type: "",
        login: "",
        password: "",
        ip: "",
      },
    ]);
  });

  it("loads multiple members correctly", async () => {
    const data = "John Doe,ADMIN,johndoe,password123,127.0.0.1\n";
    const file = new File([data], "members.csv");
    const members = await MemberLoader.loadFromCsv(file);
    expect(members).toEqual([
      {
        name: "John Doe",
        type: MemberType.ADMIN,
        login: "johndoe",
        password: "password123",
        ip: "127.0.0.1",
      },
    ]);
  });

  it("should load empty type on invalid fields", async () => {
    const data = ",INVALID,,,\n,ROOT,,,";
    const file = new File([data], "members.csv");
    const members = await MemberLoader.loadFromCsv(file);
    expect(members).toEqual([
      {
        name: "",
        type: "",
        login: "",
        password: "",
        ip: "",
      },
      {
        name: "",
        type: "",
        login: "",
        password: "",
        ip: "",
      },
    ]);
  });
});
