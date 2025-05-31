import {
  recalculatePrivateSubmissions,
  recalculatePublicSubmissions,
} from "@/app/contests/[id]/_util/submissions-calculator";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionPrivateResponseDTO } from "@/core/repository/dto/response/SubmissionPrivateResponseDTO";

describe("Submissions Calculator", () => {
  it("adds a new submission when it does not exist in public submissions", () => {
    const submissions = [] as unknown as SubmissionPublicResponseDTO[];
    const newSubmission = {
      id: 1,
      status: SubmissionStatus.ACCEPTED,
    } as unknown as SubmissionPublicResponseDTO;

    const result = recalculatePublicSubmissions(submissions, newSubmission);

    expect(result).toEqual([{ id: 1, status: SubmissionStatus.ACCEPTED }]);
  });

  it("updates the status of an existing public submission", () => {
    const submissions = [
      { id: 1, status: SubmissionStatus.JUDGING },
    ] as unknown as SubmissionPublicResponseDTO[];
    const newSubmission = {
      id: 1,
      status: SubmissionStatus.ACCEPTED,
    } as unknown as SubmissionPublicResponseDTO;

    const result = recalculatePublicSubmissions(submissions, newSubmission);

    expect(result).toEqual([{ id: 1, status: SubmissionStatus.ACCEPTED }]);
  });

  it("returns the same public submissions when no submissions exist", () => {
    const submissions = undefined;
    const newSubmission = {
      id: 1,
      status: SubmissionStatus.ACCEPTED,
    } as unknown as SubmissionPublicResponseDTO;

    const result = recalculatePublicSubmissions(submissions, newSubmission);

    expect(result).toEqual([{ id: 1, status: SubmissionStatus.ACCEPTED }]);
  });

  it("does not add a new submission when it does not exist in private submissions", () => {
    const submissions = [
      { id: 1, status: SubmissionStatus.JUDGING },
    ] as unknown as SubmissionPrivateResponseDTO[];
    const newSubmission = {
      id: 2,
      status: SubmissionStatus.ACCEPTED,
    } as unknown as SubmissionPublicResponseDTO;

    const result = recalculatePrivateSubmissions(submissions, newSubmission);

    expect(result).toEqual([{ id: 1, status: SubmissionStatus.JUDGING }]);
  });

  it("updates the status of an existing private submission", () => {
    const submissions = [
      { id: 1, status: SubmissionStatus.JUDGING },
    ] as unknown as SubmissionPrivateResponseDTO[];
    const newSubmission = {
      id: 1,
      status: SubmissionStatus.ACCEPTED,
    } as unknown as SubmissionPublicResponseDTO;

    const result = recalculatePrivateSubmissions(submissions, newSubmission);

    expect(result).toEqual([{ id: 1, status: SubmissionStatus.ACCEPTED }]);
  });

  it("returns undefined when private submissions are undefined", () => {
    const submissions = undefined;
    const newSubmission = {
      id: 1,
      status: SubmissionStatus.ACCEPTED,
    } as unknown as SubmissionPublicResponseDTO;

    const result = recalculatePrivateSubmissions(submissions, newSubmission);

    expect(result).toBeUndefined();
  });
});
