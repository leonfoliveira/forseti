package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.application.helper.leaderboard.LeaderboardCellBuilder
import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.ContestantPrivateBroadcastRoom
import com.forsetijudge.core.port.driven.cache.LeaderboardCacheStore
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class SubmissionUpdatedEventListener(
    private val submissionRepository: SubmissionRepository,
    private val leaderboardCellBuilder: LeaderboardCellBuilder,
    private val broadcastProducer: BroadcastProducer,
    private val leaderboardCacheStore: LeaderboardCacheStore,
) : BusinessEventListener<SubmissionEvent.Updated> {
    @Transactional
    override fun handle(event: SubmissionEvent.Updated) {
        val submission =
            submissionRepository.findById(event.submissionId)
                ?: throw NotFoundException("Could not find submission with id: ${event.submissionId}")
        val cellSubmissions =
            submissionRepository.findAllByMemberIdAndProblemIdAndStatus(
                memberId = submission.member.id,
                problemId = submission.problem.id,
                status = Submission.Status.JUDGED,
            )
        val leaderboardCell = leaderboardCellBuilder.build(submission.contest, submission.member, submission.problem, cellSubmissions)

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
                AdminDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
            )
            broadcastProducer.produce(
                ContestantDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
            )
            broadcastProducer.produce(
                GuestDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
            )
            broadcastProducer.produce(
                JudgeDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
            )
            broadcastProducer.produce(
                StaffDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
            )

            leaderboardCacheStore.cacheCell(submission.contest.id, leaderboardCell)
        }
    }
}
