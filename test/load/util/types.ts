export type Contest = {
  id: string;
  members: { id: string }[];
  problems: { id: string }[];
};

export type AdminDashboard = {
  submissions: {
    id: string;
    status: SubmissionStatus;
    answer: SubmissionAnswer;
    executions: {
      maxCpuTime: number;
      maxClockTime: number;
      maxPeakMemory: number;
    }[];
  }[];
};

export enum SubmissionLanguage {
  CPP_17 = "CPP_17",
  JAVA_21 = "JAVA_21",
  PYTHON_312 = "PYTHON_312",
  NODE_22 = "NODE_22",
}

export enum SubmissionStatus {
  JUDGING = "JUDGING",
  FAILED = "FAILED",
  JUDGED = "JUDGED",
}

export enum SubmissionAnswer {
  ACCEPTED = "ACCEPTED",
  WRONG_ANSWER = "WRONG_ANSWER",
  COMPILATION_ERROR = "COMPILATION_ERROR",
  RUNTIME_ERROR = "RUNTIME_ERROR",
  TIME_LIMIT_EXCEEDED = "TIME_LIMIT_EXCEEDED",
  MEMORY_LIMIT_EXCEEDED = "MEMORY_LIMIT_EXCEEDED",
}

export enum AttachmentContext {
  PROBLEM_DESCRIPTION = "PROBLEM_DESCRIPTION",
  PROBLEM_TEST_CASES = "PROBLEM_TEST_CASES",
  SUBMISSION_CODE = "SUBMISSION_CODE",
}

export enum MemberType {
  CONTESTANT = "CONTESTANT",
}
