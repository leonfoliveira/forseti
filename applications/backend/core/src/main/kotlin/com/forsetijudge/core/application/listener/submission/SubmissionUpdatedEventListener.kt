package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.ContestantPrivateBroadcastRoom
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardCellUseCase
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionUpdatedEventListener(
    private val buildLeaderboardCellUseCase: BuildLeaderboardCellUseCase,
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<SubmissionEvent.Updated>() {
    @TransactionalEventListener(SubmissionEvent.Updated::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: SubmissionEvent.Updated) {
        super.onApplicationEvent(event)
    }

    override fun handleEvent(event: SubmissionEvent.Updated) {
        val submission = event.submission
        val (leaderboardCell) =
            buildLeaderboardCellUseCase.execute(
                BuildLeaderboardCellUseCase.Command(memberId = submission.member.id, problemId = submission.problem.id),
            )

        broadcastProducer.produce(AdminDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission))
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission))
        broadcastProducer.produce(
            ContestantPrivateBroadcastRoom(submission.contest.id, submission.member.id).buildSubmissionUpdatedEvent(submission),
        )
        if (!submission.contest.isFrozen) {
            broadcastProducer.produce(ContestantDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission))
            broadcastProducer.produce(GuestDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission))
            broadcastProducer.produce(
                AdminDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell, submission.member.id),
            )
            broadcastProducer.produce(
                ContestantDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell, submission.member.id),
            )
            broadcastProducer.produce(
                GuestDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell, submission.member.id),
            )
            broadcastProducer.produce(
                JudgeDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell, submission.member.id),
            )
            broadcastProducer.produce(
                StaffDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell, submission.member.id),
            )
        }
    }
}
