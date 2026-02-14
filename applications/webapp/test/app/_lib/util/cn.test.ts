import { cn } from "@/app/_lib/util/cn";

describe("cn", () => {
  it("should combine and merge class names correctly", () => {
    const result = cn(
      "bg-red-500",
      "text-white",
      "p-4",
      "bg-red-500", // duplicate class to test merging
      { "text-lg": true, "text-sm": false }, // conditional classes
      undefined, // falsy value to be ignored
      null,
      false,
    );
    expect(result).toBe("text-white p-4 bg-red-500 text-lg");
  });
});
