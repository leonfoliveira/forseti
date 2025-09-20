import { Problem } from "@/test/entity/problem";

export class Submission {
  constructor(
    public readonly problem: Problem,
    public readonly language: SubmissionLanguage,
    public readonly code: string,
    public readonly answer: SubmissionAnswer,
  ) {}
}

export enum SubmissionLanguage {
  PYTHON_3_12 = "Python 3.12",
  CPP_17 = "C++ 17",
  JAVA_21 = "Java 21",
}

export enum SubmissionAnswer {
  ACCEPTED = "Accepted",
  WRONG_ANSWER = "Wrong Answer",
  TIME_LIMIT_EXCEEDED = "Time Limit Exceeded",
  MEMORY_LIMIT_EXCEEDED = "Memory Limit Exceeded",
  RUNTIME_ERROR = "Runtime Error",
  COMPILATION_ERROR = "Compilation Error",
}
