package io.github.leonfoliveira.judge.api.emitter

import io.github.leonfoliveira.judge.api.dto.response.submission.toFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toPublicResponseDTO
import io.github.leonfoliveira.judge.core.domain.entity.Submission
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class StompSubmissionEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun emit(submission: Submission) {
        logger.info("Emitting submission with id: ${submission.id}")
        messagingTemplate.convertAndSend(
            "/topic/contests/${submission.contest.id}/submissions",
            submission.toPublicResponseDTO(),
        )
        messagingTemplate.convertAndSend(
            "/topic/contests/${submission.contest.id}/submissions/full",
            submission.toFullResponseDTO(),
        )
        messagingTemplate.convertAndSend(
            "/topic/members/${submission.member.id}/submissions",
            submission.toPublicResponseDTO(),
        )
    }
}
