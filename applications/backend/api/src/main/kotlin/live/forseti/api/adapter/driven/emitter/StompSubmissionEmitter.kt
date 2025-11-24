package live.forseti.api.adapter.driven.emitter

import live.forseti.api.adapter.dto.response.submission.toFullResponseDTO
import live.forseti.api.adapter.dto.response.submission.toPublicResponseDTO
import live.forseti.core.domain.entity.Submission
import live.forseti.core.port.driven.WebSocketFanoutProducer
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
}
