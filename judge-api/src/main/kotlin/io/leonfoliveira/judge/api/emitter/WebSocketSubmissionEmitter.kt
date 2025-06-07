package io.leonfoliveira.judge.api.emitter

import io.leonfoliveira.judge.api.dto.response.toFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.toPublicResponseDTO
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class WebSocketSubmissionEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
) : SubmissionEmitterAdapter {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun emitForContest(submission: Submission) {
        logger.info("Emitting submission with id: ${submission.id} for contest: ${submission.contest.id}")
        messagingTemplate.convertAndSend(
            "/topic/contests/${submission.contest.id}/submissions",
            submission.toPublicResponseDTO(),
        )
        messagingTemplate.convertAndSend(
            "/topic/contests/${submission.contest.id}/submissions/full",
            submission.toFullResponseDTO(),
        )
    }

    override fun emitForMember(submission: Submission) {
        logger.info("Emitting submission with id: ${submission.id} for member: ${submission.member.id}")
        messagingTemplate.convertAndSend(
            "/topic/members/${submission.member.id}/submissions",
            submission.toPublicResponseDTO(),
        )
    }
}
