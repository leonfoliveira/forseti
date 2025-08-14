import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { findClarification } from "@/lib/util/clarification-finder";

describe("findClarification", () => {
  const mockData = [
    {
      id: "1",
      children: [
        { id: "1.1", children: [] },
        { id: "1.2", children: [] },
      ],
    },
    {
      id: "2",
      children: [
        { id: "2.1", children: [] },
        { id: "2.2", children: [] },
      ],
    },
  ] as unknown as ClarificationResponseDTO[];

  it("should return undefined if id is undefined", () => {
    expect(findClarification(mockData, undefined)).toBeUndefined();
  });

  it("should return the clarification with the matching id", () => {
    expect(findClarification(mockData, "1")).toEqual(mockData[0]);
    expect(findClarification(mockData, "1.1")).toEqual(mockData[0].children[0]);
  });

  it("should return undefined if no clarification matches the id", () => {
    expect(findClarification(mockData, "3")).toBeUndefined();
  });

  it("should handle nested clarifications correctly", () => {
    const nestedData = [
      {
        id: "1",
        children: [
          { id: "1.1", children: [{ id: "1.1.1", children: [] }] },
          { id: "1.2", children: [] },
        ],
      },
    ] as unknown as ClarificationResponseDTO[];
    expect(findClarification(nestedData, "1.1.1")).toEqual(
      nestedData[0].children[0].children[0],
    );
  });
});
