import { MemberType } from "@/domain/enumerate/MemberType";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";

export class EnumeratedTextUtil {
  public static getMemberType(type: MemberType): string {
    return {
      [MemberType.ROOT]: "Root",
      [MemberType.ADMIN]: "Admin",
      [MemberType.CONTESTANT]: "Contestant",
      [MemberType.JUDGE]: "Judge",
    }[type];
  }

  public static getSubmissionAnswer(answer: SubmissionAnswer): string {
    return {
      [SubmissionAnswer.ACCEPTED]: "Accepted",
      [SubmissionAnswer.WRONG_ANSWER]: "Wrong Answer",
      [SubmissionAnswer.RUNTIME_ERROR]: "Runtime Error",
      [SubmissionAnswer.COMPILATION_ERROR]: "Compilation Error",
      [SubmissionAnswer.TIME_LIMIT_EXCEEDED]: "Time Limit Exceeded",
      [SubmissionAnswer.MEMORY_LIMIT_EXCEEDED]: "Memory Limit Exceeded",
    }[answer];
  }

  public static getSubmissionLanguage(language: SubmissionLanguage): string {
    return {
      [SubmissionLanguage.CPP_17]: "C++17",
      [SubmissionLanguage.JAVA_21]: "Java 21",
      [SubmissionLanguage.PYTHON_312]: "Python 3.12",
      [SubmissionLanguage.NODE_22]: "Node 22",
    }[language];
  }
}
