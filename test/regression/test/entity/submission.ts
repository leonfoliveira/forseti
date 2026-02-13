import { Member } from "@/test/entity/member";
import { Problem } from "@/test/entity/problem";

export type Submission = {
  member: Member;
  problem: Problem;
  language: SubmissionLanguage;
  code: string;
  status: SubmissionStatus;
  answer: SubmissionAnswer;
};

export enum SubmissionLanguage {
  PYTHON_312 = "Python 3.12",
  CPP_17 = "C++ 17",
  JAVA_21 = "Java 21",
}

export enum SubmissionStatus {
  JUDGED = "Judged",
  FAILED = "Failed",
  JUDGING = "Judging",
}

export enum SubmissionAnswer {
  ACCEPTED = "Accepted",
  WRONG_ANSWER = "Wrong Answer",
  TIME_LIMIT_EXCEEDED = "Time Limit Exceeded",
  MEMORY_LIMIT_EXCEEDED = "Memory Limit Exceeded",
  RUNTIME_ERROR = "Runtime Error",
  COMPILATION_ERROR = "Compilation Error",
}
