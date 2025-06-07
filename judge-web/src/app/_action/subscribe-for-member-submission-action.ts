import { useAction } from "@/app/_util/action-hook";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { useEffect, useRef } from "react";
import { submissionService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useToast } from "@/app/_component/toast/toast-provider";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

export function useSubscribeForMemberSubmissionAction() {
  const alert = useAlert();
  const toast = useToast();
  const action = useAction(findAllForMember);
  const listenerRef = useRef<ListenerClient>(null);
  const { formatSubmissionAnswer } = useContestFormatter();

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        submissionService.unsubscribe(listenerRef.current);
      }
    };
  }, []);

  async function findAllForMember(memberId: string) {
    try {
      listenerRef.current = await submissionService.subscribeForMember(
        memberId,
        receiveSubmission,
      );
    } catch {
      alert.error("Error subscribing to submissions");
    }
  }

  function receiveSubmission(newSubmission: SubmissionPublicResponseDTO) {
    switch (newSubmission.answer) {
      case SubmissionAnswer.TIME_LIMIT_EXCEEDED:
        return toast.info(formatSubmissionAnswer(newSubmission.answer));
      case SubmissionAnswer.COMPILATION_ERROR:
      case SubmissionAnswer.RUNTIME_ERROR:
        return toast.warning(formatSubmissionAnswer(newSubmission.answer));
      case SubmissionAnswer.WRONG_ANSWER:
        return toast.error(formatSubmissionAnswer(newSubmission.answer));
    }
  }

  return action;
}
