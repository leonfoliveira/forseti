import { submissionFormSchema } from "@/app/contests/[id]/submissions/_form/submission-form-schema";
import { Language } from "@/core/domain/enumerate/Language";

describe("submissionFormSchema", () => {
  test("valid data passes", () => {
    const { error } = submissionFormSchema.validate({
      problemId: 1,
      language: Language.PYTHON_3_13_3,
      code: new File(["print('Hello, World!')"], "hello.py"),
    });
    expect(error).toBeUndefined();
  });

  test("undefined problemId", () => {
    const { error } = submissionFormSchema.validate({
      problemId: undefined,
      language: Language.PYTHON_3_13_3,
      code: new File(["print('Hello, World!')"], "hello.py"),
    });
    expect(error?.details[0].message).toBe("Problem is required");
  });

  test("undefined language fails", () => {
    const { error } = submissionFormSchema.validate({
      problemId: 1,
      language: undefined,
      code: new File(["print('Hello, World!')"], "hello.py"),
    });
    expect(error?.details[0].message).toBe("Language is required");
  });

  test("empty language fails", () => {
    const { error } = submissionFormSchema.validate({
      problemId: 1,
      language: "",
      code: new File(["print('Hello, World!')"], "hello.py"),
    });
    expect(error?.details[0].message).toBe("Language is required");
  });

  test("undefined code fails", () => {
    const { error } = submissionFormSchema.validate({
      problemId: 1,
      language: Language.PYTHON_3_13_3,
      code: undefined,
    });
    expect(error?.details[0].message).toBe("Code is required");
  });
});
