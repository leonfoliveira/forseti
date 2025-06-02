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
    expect(error?.details[0].message).toBe("problem.required");
  });

  test("undefined language fails", () => {
    const { error } = submissionFormSchema.validate({
      problemId: 1,
      language: undefined,
      code: new File(["print('Hello, World!')"], "hello.py"),
    });
    expect(error?.details[0].message).toBe("language.required");
  });

  test("empty language fails", () => {
    const { error } = submissionFormSchema.validate({
      problemId: 1,
      language: "",
      code: new File(["print('Hello, World!')"], "hello.py"),
    });
    expect(error?.details[0].message).toBe("language.required");
  });

  test("code size exceeds limit", () => {
    const { error } = submissionFormSchema.validate({
      problemId: 1,
      language: Language.PYTHON_3_13_3,
      code: { size: 10 * 1024 * 1024 + 1 },
    });
    expect(error?.details[0].message).toBe("code.size");
  });

  test("undefined code fails", () => {
    const { error } = submissionFormSchema.validate({
      problemId: 1,
      language: Language.PYTHON_3_13_3,
      code: undefined,
    });
    expect(error?.details[0].message).toBe("code.required");
  });
});
