import { useEffect } from "react";
import { useToast } from "@/app/_util/toast-hook";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { formatSubmissionStatus } from "@/app/_util/contest-utils";
import { useSubmissionForMemberListener } from "@/app/_listener/submission-for-member-listener";
import { SubmissionEmmitDTO } from "@/core/listener/dto/emmit/SubmissionEmmitDTO";

type Props = {
  memberId: number;
};

export function SubmissionBeacon({ memberId }: Props) {
  const submissionForMemberListener = useSubmissionForMemberListener();
  const toast = useToast();

  useEffect(() => {
    submissionForMemberListener.subscribe(memberId, receiveSubmission);
  }, []);

  function receiveSubmission(submission: SubmissionEmmitDTO) {
    if (submission.status === SubmissionStatus.JUDGING) {
      return;
    } else if (submission.status === SubmissionStatus.ACCEPTED) {
      toast.success(formatSubmissionStatus(submission.status));
    } else {
      toast.error(formatSubmissionStatus(submission.status));
    }
  }

  return null;
}
