import { MemberLoader } from "@/app/_lib/util/member-loader";

jest.mock("papaparse", () => ({
  parse: jest.fn(),
}));

describe("MemberLoader", () => {
  const mockFile = new File(
    ["contestant,CONTESTANT,login,password"],
    "test.csv",
    { type: "text/csv" },
  );
  let mockParse: jest.MockedFunction<any>;

  beforeEach(() => {
    mockParse = require("papaparse").parse;
    jest.clearAllMocks();
  });

  it("should reject if parse fails", async () => {
    mockParse.mockImplementation((file: File, options: any) => {
      options.error();
    });

    await expect(MemberLoader.loadFromCsv(mockFile)).rejects.toThrow();
  });

  it("should reject if CSV contains errors", async () => {
    mockParse.mockImplementation((file: File, options: any) => {
      options.complete({
        errors: [{ message: "Parse error" }],
      });
    });

    await expect(MemberLoader.loadFromCsv(mockFile)).rejects.toThrow();
  });

  it("should resolve with members data for valid CSV", async () => {
    mockParse.mockImplementation((file: File, options: any) => {
      options.complete({
        data: [
          ["Admin", "ADMIN", "admin", "password"],
          ["Judge", "JUDGE", "judge", "password"],
          ["Contestant", "CONTESTANT", "contestant", "password"],
        ],
        errors: [],
      });
    });

    const result = await MemberLoader.loadFromCsv(mockFile);
    expect(result).toEqual([
      {
        name: "Admin",
        type: "ADMIN",
        login: "admin",
        password: "password",
      },
      {
        name: "Judge",
        type: "JUDGE",
        login: "judge",
        password: "password",
      },
      {
        name: "Contestant",
        type: "CONTESTANT",
        login: "contestant",
        password: "password",
      },
    ]);
  });

  it("should handle missing and invalid fields in CSV", async () => {
    mockParse.mockImplementation((file: File, options: any) => {
      options.complete({
        data: [
          ["Admin", "ADMIN"], // Missing login and password
          ["Judge", "JUDGE", "judge"], // Missing password
          ["Contestant"], // Missing type, login, and password
          ["Root", "ROOT", "root", "password"], // Invalid type
          ["Other", "OTHER", "other", "password"], // Invalid type
        ],
        errors: [],
      });
    });

    const result = await MemberLoader.loadFromCsv(mockFile);
    expect(result).toEqual([
      {
        name: "Admin",
        type: "ADMIN",
        login: "",
        password: "",
      },
      {
        name: "Judge",
        type: "JUDGE",
        login: "judge",
        password: "",
      },
      {
        name: "Contestant",
        type: "",
        login: "",
        password: "",
      },
      {
        name: "Root",
        type: "",
        login: "root",
        password: "password",
      },
      {
        name: "Other",
        type: "",
        login: "other",
        password: "password",
      },
    ]);
  });
});
