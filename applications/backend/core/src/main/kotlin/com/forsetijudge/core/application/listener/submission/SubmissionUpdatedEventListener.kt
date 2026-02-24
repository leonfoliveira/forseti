package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardCellUseCase
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseBodyDTO
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionUpdatedEventListener(
    private val buildLeaderboardCellUseCase: BuildLeaderboardCellUseCase,
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) : BusinessEventListener<Submission, SubmissionEvent.Updated>() {
    @TransactionalEventListener(SubmissionEvent.Updated::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: SubmissionEvent.Updated) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Submission) {
        val submission = payload

        if (!submission.contest.isFrozen) {
            webSocketFanoutProducer.produce(
                WebSocketFanoutPayload(
                    "/topic/contests/${submission.contest.id}}/submissions",
                    submission.toResponseBodyDTO(),
                ),
            )
        }
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

        if (!submission.contest.isFrozen) {
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
        }
    }
}
