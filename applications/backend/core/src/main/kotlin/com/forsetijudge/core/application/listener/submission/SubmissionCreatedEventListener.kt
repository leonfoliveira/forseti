package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.queue.SubmissionQueueProducer
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import org.springframework.stereotype.Component

@Component
class SubmissionCreatedEventListener(
    private val submissionRepository: SubmissionRepository,
    private val broadcastProducer: BroadcastProducer,
    private val submissionQueueProducer: SubmissionQueueProducer,
) : BusinessEventListener<SubmissionEvent.Created> {
    private val logger = SafeLogger(this::class)

    override fun handle(event: SubmissionEvent.Created) {
        val submission =
            submissionRepository.findById(event.submissionId)
                ?: throw NotFoundException("Could not find submission with id: ${event.submissionId}")
        val contest = submission.contest

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildSubmissionCreatedEvent(submission))
        broadcastProducer.produce(ContestantDashboardBroadcastRoom(contest.id).buildSubmissionCreatedEvent(submission))
        broadcastProducer.produce(GuestDashboardBroadcastRoom(contest.id).buildSubmissionCreatedEvent(submission))
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildSubmissionCreatedEvent(submission))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildSubmissionCreatedEvent(submission))

        if (contest.settings.isAutoJudgeEnabled) {
            submissionQueueProducer.produce(submission)
        } else {
            logger.info("Auto judge is disabled for contest with id: ${contest.id}")
        }
    }
}
