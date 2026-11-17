import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { renderWithProviders } from "@/test/render-with-providers";
import { screen } from "@testing-library/react";
import { MemberType } from "@/domain/enumerate/MemberType";
import { PrintRequestStatus } from "@/domain/enumerate/PrintRequestStatus";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
import { I18nUtil } from "@/app/_lib/util/i18nUtil";

describe("I18nUtil", () => {
  it.each([
    [ContestStatus.NOT_STARTED, "Not Started"],
    [ContestStatus.IN_PROGRESS, "In Progress"],
    [ContestStatus.ENDED, "Ended"],
  ])("should render ContestStatus correctly", async (value, expected) => {
    await renderWithProviders(
      <FormattedMessage id={I18nUtil.getContestStatus(value)} />,
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it.each([
    [MemberType.ROOT, "Root"],
    [MemberType.ADMIN, "Admin"],
    [MemberType.JUDGE, "Judge"],
    [MemberType.STAFF, "Staff"],
    [MemberType.CONTESTANT, "Contestant"],
    [MemberType.UNOFFICIAL_CONTESTANT, "Unofficial Contestant"],
  ])("should render MemberType correctly", async (value, expected) => {
    await renderWithProviders(
      <FormattedMessage id={I18nUtil.getMemberType(value)} />,
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it.each([
    [SubmissionStatus.JUDGED, "Judged"],
    [SubmissionStatus.FAILED, "Failed"],
    [SubmissionStatus.JUDGING, "Judging"],
  ])("should render SubmissionStatus correctly", async (value, expected) => {
    await renderWithProviders(
      <FormattedMessage id={I18nUtil.getSubmissionStatus(value)} />,
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it.each([
    [SubmissionAnswer.ACCEPTED, "Accepted"],
    [SubmissionAnswer.WRONG_ANSWER, "Wrong Answer"],
    [SubmissionAnswer.COMPILATION_ERROR, "Compilation Error"],
    [SubmissionAnswer.RUNTIME_ERROR, "Runtime Error"],
    [SubmissionAnswer.MEMORY_LIMIT_EXCEEDED, "Memory Limit Exceeded"],
    [SubmissionAnswer.TIME_LIMIT_EXCEEDED, "Time Limit Exceeded"],
  ])("should render SubmissionAnswer correctly", async (value, expected) => {
    await renderWithProviders(
      <FormattedMessage id={I18nUtil.getSubmissionAnswer(value)} />,
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it.each([
    [SubmissionLanguage.CPP_17, "C++ 17"],
    [SubmissionLanguage.JAVA_21, "Java 21"],
    [SubmissionLanguage.PYTHON_312, "Python 3.12"],
    [SubmissionLanguage.NODE_22, "Node 22"],
  ])("should render SubmissionLanguage correctly", async (value, expected) => {
    await renderWithProviders(
      <FormattedMessage id={I18nUtil.getSubmissionLanguage(value)} />,
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it.each([
    [PrintRequestStatus.PENDING, "Pending"],
    [PrintRequestStatus.COMPLETED, "Completed"],
    [PrintRequestStatus.REFUSED, "Refused"],
  ])("should render PrintRequestStatus correctly", async (value, expected) => {
    await renderWithProviders(
      <FormattedMessage id={I18nUtil.getPrintRequestStatus(value)} />,
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
