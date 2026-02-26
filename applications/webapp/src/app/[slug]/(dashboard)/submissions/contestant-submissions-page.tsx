import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { contestantDashboardSlice } from "@/app/_store/slices/dashboard/contestant-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export function ContestantSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.contestantDashboard.submissions,
  );
  const memberSubmissions = useAppSelector(
    (state) => state.contestantDashboard.memberSubmissions,
  );
  const problems = useAppSelector(
    (state) => state.contestantDashboard.problems,
  );
  const dispatch = useAppDispatch();

  return (
    <SubmissionsPage
      submissions={submissions}
      memberSubmissions={memberSubmissions}
      problems={problems}
      canCreate
      onCreate={(submission: SubmissionWithCodeResponseDTO) => {
        dispatch(contestantDashboardSlice.actions.mergeSubmission(submission));
      }}
      canPrint
      onPrint={(ticket: TicketResponseDTO) => {
        dispatch(contestantDashboardSlice.actions.mergeMemberTicket(ticket));
      }}
    />
  );
}
