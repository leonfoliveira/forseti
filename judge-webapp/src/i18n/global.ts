import { defineMessages } from "react-intl";

import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";

const contestStatus = defineMessages({
  [ContestStatus.ENDED]: {
    id: "_component.format.formatted-contest.ended",
    defaultMessage: "Ended",
  },
  [ContestStatus.IN_PROGRESS]: {
    id: "_component.format.formatted-contest.in-progress",
    defaultMessage: "In progress",
  },
  [ContestStatus.NOT_STARTED]: {
    id: "_component.format.formatted-contest.not-started",
    defaultMessage: "Not started",
  },
});

const language = defineMessages({
  [Language.CPP_17]: {
    id: "_component.format.formatted-language.cpp_17",
    defaultMessage: "C++ 17",
  },
  [Language.JAVA_21]: {
    id: "_component.format.formatted-language.java_21",
    defaultMessage: "Java 21",
  },
  [Language.PYTHON_3_13]: {
    id: "_component.format.formatted-language.python_3_13",
    defaultMessage: "Python 3.13",
  },
});

const memberType = defineMessages({
  [MemberType.ROOT]: {
    id: "_component.format.formatted-member-type.root",
    defaultMessage: "Root",
  },
  [MemberType.CONTESTANT]: {
    id: "_component.format.formatted-member-type.contestant",
    defaultMessage: "Contestant",
  },
  [MemberType.JUDGE]: {
    id: "_component.format.formatted-member-type.judge",
    defaultMessage: "Judge",
  },
});

const submissionAnswerShort = defineMessages({
  [SubmissionAnswer.NO_ANSWER]: {
    id: "_component.format.formatted-submission-answer-short.no_answer",
    defaultMessage: "",
  },
  [SubmissionAnswer.ACCEPTED]: {
    id: "_component.format.formatted-submission-answer-short.accepted",
    defaultMessage: "AC",
  },
  [SubmissionAnswer.WRONG_ANSWER]: {
    id: "_component.format.formatted-submission-answer-short.wrong_answer",
    defaultMessage: "WA",
  },
  [SubmissionAnswer.COMPILATION_ERROR]: {
    id: "_component.format.formatted-submission-answer-short.compilation_error",
    defaultMessage: "CE",
  },
  [SubmissionAnswer.RUNTIME_ERROR]: {
    id: "_component.format.formatted-submission-answer-short.runtime_error",
    defaultMessage: "RE",
  },
  [SubmissionAnswer.TIME_LIMIT_EXCEEDED]: {
    id: "_component.format.formatted-submission-answer-short.time_limit_exceeded",
    defaultMessage: "TLE",
  },
  [SubmissionAnswer.MEMORY_LIMIT_EXCEEDED]: {
    id: "_component.format.formatted-submission-answer-short.memory_limit_exceeded",
    defaultMessage: "MLE",
  },
});

const submissionAnswer = defineMessages({
  [SubmissionAnswer.NO_ANSWER]: {
    id: "_component.format.formatted-submission-answer.no_answer",
    defaultMessage: "Judging",
  },
  [SubmissionAnswer.ACCEPTED]: {
    id: "_component.format.formatted-submission-answer.accepted",
    defaultMessage: "Accepted",
  },
  [SubmissionAnswer.WRONG_ANSWER]: {
    id: "_component.format.formatted-submission-answer.wrong_answer",
    defaultMessage: "Wrong Answer",
  },
  [SubmissionAnswer.COMPILATION_ERROR]: {
    id: "_component.format.formatted-submission-answer.compilation_error",
    defaultMessage: "Compilation Error",
  },
  [SubmissionAnswer.RUNTIME_ERROR]: {
    id: "_component.format.formatted-submission-answer.runtime_error",
    defaultMessage: "Runtime Error",
  },
  [SubmissionAnswer.TIME_LIMIT_EXCEEDED]: {
    id: "_component.format.formatted-submission-answer.time_limit_exceeded",
    defaultMessage: "Time Limit Exceeded",
  },
  [SubmissionAnswer.MEMORY_LIMIT_EXCEEDED]: {
    id: "_component.format.formatted-submission-answer.memory_limit_exceeded",
    defaultMessage: "Memory Limit Exceeded",
  },
});

const submissionStatus = defineMessages({
  [SubmissionStatus.JUDGING]: {
    id: "_component.format.formatted-submission-status.judging",
    defaultMessage: "Judging",
  },
  [SubmissionStatus.FAILED]: {
    id: "_component.format.formatted-submission-status.failed",
    defaultMessage: "Failed",
  },
  [SubmissionStatus.JUDGED]: {
    id: "_component.format.formatted-submission-status.judged",
    defaultMessage: "Judged",
  },
});

export const globalMessages = {
  contestStatus,
  language,
  memberType,
  submissionAnswerShort,
  submissionAnswer,
  submissionStatus,
};
