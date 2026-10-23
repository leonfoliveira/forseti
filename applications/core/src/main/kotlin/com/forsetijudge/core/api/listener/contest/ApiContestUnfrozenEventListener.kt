package com.forsetijudge.core.api.listener.contest

import com.forsetijudge.core.api.http.sse.SSE
import com.forsetijudge.core.api.http.sse.SSERoomBuilder
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageProducer
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.contest.toResponseDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseDTO
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionalEventListener

@Component
@Suppress("unused")
class ApiContestUnfrozenEventListener(
    private val contestRepository: ContestRepository,
    private val submissionRepository: SubmissionRepository,
    private val leaderboardBuilder: LeaderboardBuilder,
    private val sseFanoutRedisMessageProducer: SSEFanoutRedisMessageProducer,
) {
    private val logger = SafeLogger(this::class)

    @TransactionalEventListener
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    fun handle(event: ContestEvent.Unfrozen) {
        logger.info("Handling contest unfrozen event for contest with id: ${event.contestId}")

        val contest =
            contestRepository.findByIdNullable(event.contestId)
                ?: throw NotFoundException("Could not find contest with id: ${event.contestId}")
        val leaderboard = leaderboardBuilder.build(contest = contest)
        val submissions =
            submissionRepository
                .findAllByContestAndUpdatedAtAfter(contest.id, event.frozenAt)

        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildAdminDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_UNFROZEN.name,
                data =
                    mapOf(
                        "contest" to contest.toWithMembersAndProblemsResponseDTO(),
                        "leaderboard" to leaderboard.toResponseDTO(),
                        "submissions" to submissions.map { it.toWithCodeAndExecutionResponseDTO() },
                    ),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildJudgeDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_UNFROZEN.name,
                mapOf(
                    "contest" to contest.toWithMembersAndProblemsResponseDTO(),
                    "leaderboard" to leaderboard.toResponseDTO(),
                    "submissions" to submissions.map { it.toWithCodeAndExecutionResponseDTO() },
                ),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildStaffDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_UNFROZEN.name,
                mapOf(
                    "contest" to contest.toResponseDTO(),
                    "leaderboard" to leaderboard.toResponseDTO(),
                    "submissions" to submissions.map { it.toWithCodeResponseDTO() },
                ),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildContestantDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_UNFROZEN.name,
                mapOf(
                    "contest" to contest.toResponseDTO(),
                    "leaderboard" to leaderboard.toResponseDTO(),
                    "submissions" to submissions.map { it.toResponseDTO() },
                ),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildSpectatorDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_UNFROZEN.name,
                mapOf(
                    "contest" to contest.toResponseDTO(),
                    "leaderboard" to leaderboard.toResponseDTO(),
                    "submissions" to submissions.map { it.toResponseDTO() },
                ),
            ),
        )
    }
}
