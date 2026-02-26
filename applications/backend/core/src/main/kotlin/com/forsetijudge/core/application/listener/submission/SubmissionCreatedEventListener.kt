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
import com.forsetijudge.core.port.driven.queue.SubmissionQueueProducer
import com.forsetijudge.core.port.driven.queue.payload.SubmissionQueuePayload
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardCellUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionCreatedEventListener(
    private val buildLeaderboardCellUseCase: BuildLeaderboardCellUseCase,
    private val broadcastProducer: BroadcastProducer,
    private val submissionQueueProducer: SubmissionQueueProducer,
) : BusinessEventListener<SubmissionEvent.Created>() {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(SubmissionEvent.Created::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: SubmissionEvent.Created) {
        super.onApplicationEvent(event)
    }

    override fun handleEvent(event: SubmissionEvent.Created) {
        val submission = event.submission
        val contest = submission.contest

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildSubmissionCreatedEvent(submission))
        broadcastProducer.produce(ContestantDashboardBroadcastRoom(contest.id).buildSubmissionCreatedEvent(submission))
        broadcastProducer.produce(GuestDashboardBroadcastRoom(contest.id).buildSubmissionCreatedEvent(submission))
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildSubmissionCreatedEvent(submission))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildSubmissionCreatedEvent(submission))

        if (submission.contest.settings.isAutoJudgeEnabled) {
            submissionQueueProducer.produce(SubmissionQueuePayload(submissionId = submission.id))
        } else {
            logger.info("Auto judge is disabled for contest with id: ${contest.id}")
        }
    }
}
