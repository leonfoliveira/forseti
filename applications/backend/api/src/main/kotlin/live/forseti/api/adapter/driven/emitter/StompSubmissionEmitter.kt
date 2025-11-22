package live.forseti.api.adapter.driven.emitter

import live.forseti.api.adapter.dto.response.submission.toFullResponseDTO
import live.forseti.api.adapter.dto.response.submission.toPublicResponseDTO
import live.forseti.core.domain.entity.Submission
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class StompSubmissionEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
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

        messagingTemplate.convertAndSend(
            "/topic/contests/${contest.id}/submissions",
            submission.toPublicResponseDTO(),
        )
        messagingTemplate.convertAndSend(
            "/topic/contests/${contest.id}/submissions/full",
            submission.toFullResponseDTO(),
        )
        messagingTemplate.convertAndSend(
            "/topic/contests/${contest.id}/submissions/full/members/${submission.member.id}",
            submission.toFullResponseDTO(),
        )
    }
}
