import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";
import { ContestantDashboardSlice } from "@/app/_store/slice/dashboard/ContestantDashboardSlice";
import { useAppDispatch, useAppSelector } from "@/app/_store/Store";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

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
        dispatch(ContestantDashboardSlice.actions.mergeSubmission(submission));
      }}
    />
  );
}
