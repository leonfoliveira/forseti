import type { ParseKeys } from "i18next";

import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { MemberType } from "@/domain/enumerate/MemberType";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { PrintRequestStatus } from "@/domain/enumerate/PrintRequestStatus";

export class I18nUtil {
  static getContestStatus(status: ContestStatus): ParseKeys {
    return (
      {
        [ContestStatus.NOT_STARTED]:
          "_lib.util.i18nUtil.contestStatus.notStarted",
        [ContestStatus.IN_PROGRESS]:
          "_lib.util.i18nUtil.contestStatus.inProgress",
        [ContestStatus.ENDED]: "_lib.util.i18nUtil.contestStatus.ended",
      } as Record<ContestStatus, ParseKeys>
    )[status];
  }

  static getMemberType(type: MemberType): ParseKeys {
    return (
      {
        [MemberType.ROOT]: "_lib.util.i18nUtil.memberType.root",
        [MemberType.ADMIN]: "_lib.util.i18nUtil.memberType.admin",
        [MemberType.JUDGE]: "_lib.util.i18nUtil.memberType.judge",
        [MemberType.STAFF]: "_lib.util.i18nUtil.memberType.staff",
        [MemberType.CONTESTANT]: "_lib.util.i18nUtil.memberType.contestant",
        [MemberType.UNOFFICIAL_CONTESTANT]:
          "_lib.util.i18nUtil.memberType.unofficialContestant",
      } as Record<MemberType, ParseKeys>
    )[type];
  }

  static getSubmissionStatus(status: SubmissionStatus): ParseKeys {
    return (
      {
        [SubmissionStatus.JUDGED]: "_lib.util.i18nUtil.submissionStatus.judged",
        [SubmissionStatus.FAILED]: "_lib.util.i18nUtil.submissionStatus.failed",
        [SubmissionStatus.JUDGING]:
          "_lib.util.i18nUtil.submissionStatus.judging",
      } as Record<SubmissionStatus, ParseKeys>
    )[status];
  }

  static getSubmissionAnswer(answer: SubmissionAnswer): ParseKeys {
    return (
      {
        [SubmissionAnswer.ACCEPTED]:
          "_lib.util.i18nUtil.submissionAnswer.accepted",
        [SubmissionAnswer.WRONG_ANSWER]:
          "_lib.util.i18nUtil.submissionAnswer.wrongAnswer",
        [SubmissionAnswer.COMPILATION_ERROR]:
          "_lib.util.i18nUtil.submissionAnswer.compilationError",
        [SubmissionAnswer.RUNTIME_ERROR]:
          "_lib.util.i18nUtil.submissionAnswer.runtimeError",
        [SubmissionAnswer.MEMORY_LIMIT_EXCEEDED]:
          "_lib.util.i18nUtil.submissionAnswer.memoryLimitExceeded",
        [SubmissionAnswer.TIME_LIMIT_EXCEEDED]:
          "_lib.util.i18nUtil.submissionAnswer.timeLimitExceeded",
      } as Record<SubmissionAnswer, ParseKeys>
    )[answer];
  }

  static getSubmissionLanguage(language: SubmissionLanguage): ParseKeys {
    return (
      {
        [SubmissionLanguage.CPP_17]:
          "_lib.util.i18nUtil.submissionLanguage.cpp17",
        [SubmissionLanguage.JAVA_21]:
          "_lib.util.i18nUtil.submissionLanguage.java21",
        [SubmissionLanguage.PYTHON_312]:
          "_lib.util.i18nUtil.submissionLanguage.python312",
        [SubmissionLanguage.NODE_22]:
          "_lib.util.i18nUtil.submissionLanguage.node22",
      } as Record<SubmissionLanguage, ParseKeys>
    )[language];
  }

  static getPrintRequestStatus(status: PrintRequestStatus): ParseKeys {
    return (
      {
        [PrintRequestStatus.PENDING]:
          "_lib.util.i18nUtil.printRequestStatus.pending",
        [PrintRequestStatus.COMPLETED]:
          "_lib.util.i18nUtil.printRequestStatus.completed",
        [PrintRequestStatus.REFUSED]:
          "_lib.util.i18nUtil.printRequestStatus.refused",
      } as Record<PrintRequestStatus, ParseKeys>
    )[status];
  }
}
