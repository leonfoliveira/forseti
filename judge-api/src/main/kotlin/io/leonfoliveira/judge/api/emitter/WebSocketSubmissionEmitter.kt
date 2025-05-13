package io.leonfoliveira.judge.api.emitter

import io.leonfoliveira.judge.api.dto.response.toResponseDTO
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class WebSocketSubmissionEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
) : SubmissionEmitterAdapter {
    override fun emit(submission: Submission) {
        messagingTemplate.convertAndSend(
            "/topic/contests/${submission.contest}/submissions",
            submission.toResponseDTO(),
        )
    }
}
