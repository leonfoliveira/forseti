import { MemberType } from "@/domain/enumerate/MemberType";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { PrintRequestStatus } from "@/domain/enumerate/PrintRequestStatus";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";

export class EnumeratedTextUtil {
  public static getContestStatus(status: ContestStatus): string {
    return {
      [ContestStatus.NOT_STARTED]: "Not Started",
      [ContestStatus.IN_PROGRESS]: "In Progress",
      [ContestStatus.ENDED]: "Ended",
    }[status];
  }

  public static getMemberType(type: MemberType): string {
    return {
      [MemberType.ROOT]: "Root",
      [MemberType.ADMIN]: "Admin",
      [MemberType.JUDGE]: "Judge",
      [MemberType.STAFF]: "Staff",
      [MemberType.CONTESTANT]: "Contestant",
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

  public static getPrintRequestStatus(status: PrintRequestStatus): string {
    return {
      [PrintRequestStatus.PENDING]: "Pending",
      [PrintRequestStatus.COMPLETED]: "Completed",
      [PrintRequestStatus.REFUSED]: "Refused",
    }[status];
  }
}
