import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { defineMessages } from "@/i18n/message";

const contestStatus = defineMessages({
  [ContestStatus.ENDED]: {
    id: "i18n.global.formatted-contest.ended",
    defaultMessage: "Ended",
  },
  [ContestStatus.IN_PROGRESS]: {
    id: "i18n.global.formatted-contest.in-progress",
    defaultMessage: "In Progress",
  },
  [ContestStatus.NOT_STARTED]: {
    id: "i18n.global.formatted-contest.not-started",
    defaultMessage: "Not Started",
  },
});

const language = defineMessages({
  [Language.CPP_17]: {
    id: "i18n.global.formatted-language.cpp_17",
    defaultMessage: "C++ 17",
  },
  [Language.JAVA_21]: {
    id: "i18n.global.formatted-language.java_21",
    defaultMessage: "Java 21",
  },
  [Language.PYTHON_3_13]: {
    id: "i18n.global.formatted-language.python_3_13",
    defaultMessage: "Python 3.13",
  },
});

const memberType = defineMessages({
  [MemberType.ROOT]: {
    id: "i18n.global.formatted-member-type.root",
    defaultMessage: "Root",
  },
  [MemberType.ADMIN]: {
    id: "i18n.global.formatted-member-type.admin",
    defaultMessage: "Admin",
  },
  [MemberType.CONTESTANT]: {
    id: "i18n.global.formatted-member-type.contestant",
    defaultMessage: "Contestant",
  },
  [MemberType.JUDGE]: {
    id: "i18n.global.formatted-member-type.judge",
    defaultMessage: "Judge",
  },
});

const submissionAnswer = defineMessages({
  [SubmissionAnswer.NO_ANSWER]: {
    id: "i18n.global.formatted-submission-answer.no_answer",
    defaultMessage: "Judging",
  },
  [SubmissionAnswer.ACCEPTED]: {
    id: "i18n.global.formatted-submission-answer.accepted",
    defaultMessage: "Accepted",
  },
  [SubmissionAnswer.WRONG_ANSWER]: {
    id: "i18n.global.formatted-submission-answer.wrong_answer",
    defaultMessage: "Wrong Answer",
  },
  [SubmissionAnswer.COMPILATION_ERROR]: {
    id: "i18n.global.formatted-submission-answer.compilation_error",
    defaultMessage: "Compilation Error",
  },
  [SubmissionAnswer.RUNTIME_ERROR]: {
    id: "i18n.global.formatted-submission-answer.runtime_error",
    defaultMessage: "Runtime Error",
  },
  [SubmissionAnswer.TIME_LIMIT_EXCEEDED]: {
    id: "i18n.global.formatted-submission-answer.time_limit_exceeded",
    defaultMessage: "Time Limit Exceeded",
  },
  [SubmissionAnswer.MEMORY_LIMIT_EXCEEDED]: {
    id: "i18n.global.formatted-submission-answer.memory_limit_exceeded",
    defaultMessage: "Memory Limit Exceeded",
  },
});

const submissionStatus = defineMessages({
  [SubmissionStatus.JUDGING]: {
    id: "i18n.global.formatted-submission-status.judging",
    defaultMessage: "Judging",
  },
  [SubmissionStatus.FAILED]: {
    id: "i18n.global.formatted-submission-status.failed",
    defaultMessage: "Failed",
  },
  [SubmissionStatus.JUDGED]: {
    id: "i18n.global.formatted-submission-status.judged",
    defaultMessage: "Judged",
  },
});

export const globalMessages = {
  contestStatus,
  language,
  memberType,
  submissionAnswer,
  submissionStatus,
};
