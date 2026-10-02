import { EnumeratedTextUtil } from "@/app/_lib/util/EnumeratedTextUtil";
import { MemberType } from "@/domain/enumerate/MemberType";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";

describe("EnumeratedTextUtil", () => {
  it("maps member types, submission answers, and languages to labels", () => {
    expect(EnumeratedTextUtil.getMemberType(MemberType.ADMIN)).toBe("Admin");
    expect(EnumeratedTextUtil.getSubmissionAnswer(SubmissionAnswer.WRONG_ANSWER)).toBe("Wrong Answer");
    expect(EnumeratedTextUtil.getSubmissionLanguage(SubmissionLanguage.JAVA_21)).toBe("Java 21");
  });
});
