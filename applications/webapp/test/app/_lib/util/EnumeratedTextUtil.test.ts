import { EnumeratedTextUtil } from "@/app/_lib/util/EnumeratedTextUtil";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { MemberType } from "@/domain/enumerate/MemberType";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { PrintRequestStatus } from "@/domain/enumerate/PrintRequestStatus";

describe("EnumeratedTextUtil", () => {
  it("maps contest status to labels", () => {
    expect(EnumeratedTextUtil.getContestStatus(ContestStatus.NOT_STARTED)).toBe(
      "Not Started",
    );
    expect(EnumeratedTextUtil.getContestStatus(ContestStatus.IN_PROGRESS)).toBe(
      "In Progress",
    );
    expect(EnumeratedTextUtil.getContestStatus(ContestStatus.ENDED)).toBe(
      "Ended",
    );
  });

  it("maps member types to labels", () => {
    expect(EnumeratedTextUtil.getMemberType(MemberType.ROOT)).toBe("Root");
    expect(EnumeratedTextUtil.getMemberType(MemberType.ADMIN)).toBe("Admin");
    expect(EnumeratedTextUtil.getMemberType(MemberType.JUDGE)).toBe("Judge");
    expect(EnumeratedTextUtil.getMemberType(MemberType.STAFF)).toBe("Staff");
    expect(EnumeratedTextUtil.getMemberType(MemberType.CONTESTANT)).toBe(
      "Contestant",
    );
  });

  it("maps submission answers to labels", () => {
    expect(
      EnumeratedTextUtil.getSubmissionAnswer(SubmissionAnswer.ACCEPTED),
    ).toBe("Accepted");
    expect(
      EnumeratedTextUtil.getSubmissionAnswer(SubmissionAnswer.WRONG_ANSWER),
    ).toBe("Wrong Answer");
    expect(
      EnumeratedTextUtil.getSubmissionAnswer(SubmissionAnswer.RUNTIME_ERROR),
    ).toBe("Runtime Error");
    expect(
      EnumeratedTextUtil.getSubmissionAnswer(
        SubmissionAnswer.COMPILATION_ERROR,
      ),
    ).toBe("Compilation Error");
    expect(
      EnumeratedTextUtil.getSubmissionAnswer(
        SubmissionAnswer.TIME_LIMIT_EXCEEDED,
      ),
    ).toBe("Time Limit Exceeded");
    expect(
      EnumeratedTextUtil.getSubmissionAnswer(
        SubmissionAnswer.MEMORY_LIMIT_EXCEEDED,
      ),
    ).toBe("Memory Limit Exceeded");
  });

  it("maps submission languages to labels", () => {
    expect(
      EnumeratedTextUtil.getSubmissionLanguage(SubmissionLanguage.CPP_17),
    ).toBe("C++ 17");
    expect(
      EnumeratedTextUtil.getSubmissionLanguage(SubmissionLanguage.JAVA_21),
    ).toBe("Java 21");
    expect(
      EnumeratedTextUtil.getSubmissionLanguage(SubmissionLanguage.PYTHON_312),
    ).toBe("Python 3.12");
    expect(
      EnumeratedTextUtil.getSubmissionLanguage(SubmissionLanguage.NODE_22),
    ).toBe("Node 22");
  });

  it("maps print request status to labels", () => {
    expect(
      EnumeratedTextUtil.getPrintRequestStatus(PrintRequestStatus.PENDING),
    ).toBe("Pending");
    expect(
      EnumeratedTextUtil.getPrintRequestStatus(PrintRequestStatus.COMPLETED),
    ).toBe("Completed");
    expect(
      EnumeratedTextUtil.getPrintRequestStatus(PrintRequestStatus.REFUSED),
    ).toBe("Refused");
  });
});
