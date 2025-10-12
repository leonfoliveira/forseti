package io.github.leonfoliveira.forseti.api.emitter

import io.github.leonfoliveira.forseti.api.dto.response.submission.toFullResponseDTO
import io.github.leonfoliveira.forseti.api.dto.response.submission.toPublicResponseDTO
import io.github.leonfoliveira.forseti.common.domain.entity.Submission
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class StompSubmissionEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

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
