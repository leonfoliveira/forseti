package com.forsetijudge.core.api.listener

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutRedisMessageProducer
import com.forsetijudge.core.api.websocket.room.SocketIOAdminDashboardRoom
import com.forsetijudge.core.api.websocket.room.SocketIOContestantDashboardRoom
import com.forsetijudge.core.api.websocket.room.SocketIOGuestDashboardRoom
import com.forsetijudge.core.api.websocket.room.SocketIOJudgeDashboardRoom
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardCellBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.output.cache.LeaderboardCacheStore
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class ApiSubmissionUpdatedEventListener(
    private val submissionRepository: SubmissionRepository,
    private val leaderboardCellBuilder: LeaderboardCellBuilder,
    private val socketIOFanoutRedisMessageProducer: SocketIOFanoutRedisMessageProducer,
    private val leaderboardCacheStore: LeaderboardCacheStore,
) {
    @Transactional
    fun handle(event: SubmissionEvent.Updated) {
        val submission =
            submissionRepository.findById(event.submissionId)
                ?: throw NotFoundException("Could not find submission with id: ${event.submissionId}")
        val cellSubmissions =
            submissionRepository.findAllByMemberIdAndProblemIdAndStatus(
                memberId = submission.member.id,
                problemId = submission.problem.id,
                status = Submission.Status.JUDGED,
            )
        val leaderboardCell =
            leaderboardCellBuilder.build(submission.contest, submission.member, submission.problem, cellSubmissions)

        socketIOFanoutRedisMessageProducer.produce(
            SocketIOContestantDashboardRoom(submission.contest.id).buildSubmissionUpdatedEvent(
                submission,
            ),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOGuestDashboardRoom(submission.contest.id).buildSubmissionUpdatedEvent(
                submission,
            ),
        )

        socketIOFanoutRedisMessageProducer.produce(
            SocketIOAdminDashboardRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOContestantDashboardRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOGuestDashboardRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOJudgeDashboardRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
        )

        leaderboardCacheStore.cacheCell(submission.contest.id, leaderboardCell)
    }
}
