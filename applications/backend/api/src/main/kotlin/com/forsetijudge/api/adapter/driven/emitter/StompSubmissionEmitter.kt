package com.forsetijudge.api.adapter.driven.emitter

import com.forsetijudge.api.adapter.dto.response.submission.toFullResponseDTO
import com.forsetijudge.api.adapter.dto.response.submission.toPublicResponseDTO
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

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

        webSocketFanoutProducer.produce(
            "/topic/contests/${contest.id}/submissions",
            submission.toPublicResponseDTO(),
        )
        webSocketFanoutProducer.produce(
            "/topic/contests/${contest.id}/submissions/full",
            submission.toFullResponseDTO(),
        )
        webSocketFanoutProducer.produce(
            "/topic/contests/${contest.id}/submissions/full/members/${submission.member.id}",
            submission.toFullResponseDTO(),
        )
    }

    /**
     * Emits a submission to the appropriate STOMP topics only if the contest is not frozen.
     *
     * @param submission The submission to be emitted.
     */
    fun emitNonFrozen(submission: Submission) {
        logger.info(
            "Emitting submission with id: ${submission.id} " +
                "for contest: ${submission.contest.id} and member: ${submission.member.id} (non-frozen only)",
        )

        val contest = submission.contest

        if (!contest.isFrozen) {
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
}
