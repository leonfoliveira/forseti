import { ClarificationFormType } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form";
import { ClarificationFormMap } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form-map";

describe("ClarificationFormMap", () => {
  it("should map to InputDTO with problemId and parentId", () => {
    const data = {
      problemId: "problem-1",
      parentId: "parent-1",
      text: "New Clarification",
    } as ClarificationFormType;

    const inputDTO = ClarificationFormMap.toInputDTO(data);

    expect(inputDTO).toEqual({
      problemId: "problem-1",
      parentId: "parent-1",
      text: "New Clarification",
    });
  });

  it("should map to InputDTO with only problemId", () => {
    const data = {
      problemId: "problem-1",
      text: "New Clarification",
    } as ClarificationFormType;

    const inputDTO = ClarificationFormMap.toInputDTO(data);

    expect(inputDTO).toEqual({
      problemId: "problem-1",
      parentId: undefined,
      text: "New Clarification",
    });
  });

  it("should map to InputDTO with empty problemId", () => {
    const data = {
      problemId: "",
      parentId: "parent-1",
      text: "New Clarification",
    } as ClarificationFormType;

    const inputDTO = ClarificationFormMap.toInputDTO(data);

    expect(inputDTO).toEqual({
      problemId: undefined,
      parentId: "parent-1",
      text: "New Clarification",
    });
  });

  it("should map to InputDTO with empty parentId", () => {
    const data = {
      problemId: "problem-1",
      parentId: "",
      text: "New Clarification",
    } as ClarificationFormType;

    const inputDTO = ClarificationFormMap.toInputDTO(data);

    expect(inputDTO).toEqual({
      problemId: "problem-1",
      parentId: undefined,
      text: "New Clarification",
    });
  });

  it("should map to InputDTO without problemId and parentId", () => {
    const data = {
      text: "New Clarification",
    } as ClarificationFormType;

    const inputDTO = ClarificationFormMap.toInputDTO(data);

    expect(inputDTO).toEqual({
      problemId: undefined,
      parentId: undefined,
      text: "New Clarification",
    });
  });
});
