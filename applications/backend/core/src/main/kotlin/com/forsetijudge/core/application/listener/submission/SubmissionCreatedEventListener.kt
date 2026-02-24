package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.port.driven.producer.SubmissionQueueProducer
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.SubmissionQueuePayload
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardCellUseCase
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionCreatedEventListener(
    private val buildLeaderboardCellUseCase: BuildLeaderboardCellUseCase,
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
    private val submissionQueueProducer: SubmissionQueueProducer,
) : BusinessEventListener<Submission, SubmissionEvent.Created>() {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(SubmissionEvent.Created::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: SubmissionEvent.Created) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Submission) {
        val submission = payload

        webSocketFanoutProducer.produce(
            WebSocketFanoutPayload(
                "/topic/contests/${submission.contest.id}}/submissions",
                submission.toResponseBodyDTO(),
            ),
        )
        webSocketFanoutProducer.produce(
            WebSocketFanoutPayload(
                "/topic/contests/${submission.contest.id}/submissions:with-code-and-execution",
                submission.toWithCodeAndExecutionResponseBodyDTO(),
            ),
        )
        webSocketFanoutProducer.produce(
            WebSocketFanoutPayload(
                "/topic/contests/${submission.contest.id}/members/${submission.member.id}/submissions:with-code",
                submission.toWithCodeResponseBodyDTO(),
            ),
        )

        val (leaderboardCell) =
            buildLeaderboardCellUseCase.execute(
                BuildLeaderboardCellUseCase.Command(
                    memberId = submission.member.id,
                    problemId = submission.problem.id,
                ),
            )
        webSocketFanoutProducer.produce(
            WebSocketFanoutPayload(
                "/topic/contests/${submission.contest.id}/leaderboard:cell",
                leaderboardCell.toResponseBodyDTO(submission.member.id),
            ),
        )

        if (submission.contest.settings.isAutoJudgeEnabled) {
            submissionQueueProducer.produce(SubmissionQueuePayload(submissionId = submission.id))
        } else {
            logger.info("Auto judge is disabled for contest with id: ${submission.contest.id}")
        }
    }
}
