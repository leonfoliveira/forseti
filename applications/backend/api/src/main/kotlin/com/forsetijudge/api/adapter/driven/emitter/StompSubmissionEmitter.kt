package com.forsetijudge.api.adapter.driven.emitter

import com.forsetijudge.api.adapter.dto.response.submission.toFullResponseDTO
import com.forsetijudge.api.adapter.dto.response.submission.toPublicResponseDTO
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.driven.WebSocketFanoutProducer
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.io.Serializable

@Component
class StompSubmissionEmitter(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Emits a submission to the appropriate STOMP topics.
     *
     * @param submission The submission to be emitted.
     */
    fun emit(submission: Submission) {
        logger.info(
            "Emitting submission with id: ${submission.id} " +
                "for contest: ${submission.contest.id} and member: ${submission.member.id}",
        )

        val contest = submission.contest

        if (!contest.isFrozen()) {
            webSocketFanoutProducer.produce(
                "/topic/contests/${contest.id}/submissions",
                submission.toPublicResponseDTO(),
            )
        }
        webSocketFanoutProducer.produce(
            "/topic/contests/${contest.id}/submissions/full",
            submission.toFullResponseDTO(),
        )
        webSocketFanoutProducer.produce(
            "/topic/contests/${contest.id}/submissions/full/members/${submission.member.id}",
            submission.toFullResponseDTO(),
        )
    }

    fun emitBatch(submissions: List<Submission>) {
        if (submissions.isEmpty()) return

        val contestId = submissions.first().contest.id

        logger.info(
            "Emitting batch of ${submissions.size} submissions for contest: $contestId",
        )

        webSocketFanoutProducer.produce(
            "/topic/contests/$contestId/submissions/batch",
            submissions.map { it.toPublicResponseDTO() } as Serializable,
        )
    }
}
