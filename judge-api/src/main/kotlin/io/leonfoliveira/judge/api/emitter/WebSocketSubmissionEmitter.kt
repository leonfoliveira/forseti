package io.leonfoliveira.judge.api.emitter

import io.leonfoliveira.judge.api.emitter.dto.emmit.toEmmitDTO
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class WebSocketSubmissionEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
) : SubmissionEmitterAdapter {
    override fun emitForContest(submission: Submission) {
        messagingTemplate.convertAndSend(
            "/topic/contests/${submission.contest.id}/submissions",
            submission.toEmmitDTO(),
        )
    }

    override fun emitForMember(submission: Submission) {
        messagingTemplate.convertAndSend(
            "/topic/members/${submission.member.id}/submissions",
            submission.toEmmitDTO(),
        )
    }
}
