package com.forsetijudge.core.api.listener.submission

import com.forsetijudge.core.api.http.sse.SSE
import com.forsetijudge.core.api.http.sse.SSERoomBuilder
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageProducer
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardCellBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseDTO
import com.forsetijudge.core.port.output.cache.LeaderboardCacheStore
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionalEventListener

@Component
@Suppress("unused")
class ApiSubmissionUpdatedEventListener(
    private val submissionRepository: SubmissionRepository,
    private val leaderboardCellBuilder: LeaderboardCellBuilder,
    private val sseFanoutRedisMessageProducer: SSEFanoutRedisMessageProducer,
    private val leaderboardCacheStore: LeaderboardCacheStore,
) {
    private val logger = SafeLogger(this::class)

    @TransactionalEventListener
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    fun handle(event: SubmissionEvent.Updated) {
        logger.info("Handling submission updated event for submission with id: ${event.submissionId}")

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

        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildAdminDashboardRoom(submission.contest.id),
                eventName = SSE.SUBMISSION_UPDATED.name,
                data = submission.toWithCodeAndExecutionResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildJudgeDashboardRoom(submission.contest.id),
                eventName = SSE.SUBMISSION_UPDATED.name,
                data = submission.toWithCodeAndExecutionResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildStaffDashboardRoom(submission.contest.id),
                eventName = SSE.SUBMISSION_UPDATED.name,
                data = submission.toWithCodeResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildContestantDashboardRoom(submission.contest.id),
                eventName = SSE.SUBMISSION_UPDATED.name,
                data = submission.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildSpectatorDashboardRoom(submission.contest.id),
                eventName = SSE.SUBMISSION_UPDATED.name,
                data = submission.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildMemberPrivateRoom(submission.member.id),
                eventName = SSE.SUBMISSION_UPDATED.name,
                data = submission.toWithCodeResponseDTO(),
            ),
        )

        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildAdminDashboardRoom(submission.contest.id),
                eventName = SSE.LEADERBOARD_UPDATED.name,
                data = leaderboardCell.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildJudgeDashboardRoom(submission.contest.id),
                eventName = SSE.LEADERBOARD_UPDATED.name,
                data = leaderboardCell.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildStaffDashboardRoom(submission.contest.id),
                eventName = SSE.LEADERBOARD_UPDATED.name,
                data = leaderboardCell.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildContestantDashboardRoom(submission.contest.id),
                eventName = SSE.LEADERBOARD_UPDATED.name,
                data = leaderboardCell.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildSpectatorDashboardRoom(submission.contest.id),
                eventName = SSE.LEADERBOARD_UPDATED.name,
                data = leaderboardCell.toResponseDTO(),
            ),
        )

        leaderboardCacheStore.cacheCell(submission.contest.id, leaderboardCell)
    }
}
