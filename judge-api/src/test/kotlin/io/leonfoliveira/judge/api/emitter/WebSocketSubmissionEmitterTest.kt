package io.leonfoliveira.judge.api.emitter

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.emitter.dto.emmit.toEmmitDTO
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.mockk.mockk
import io.mockk.verify
import org.springframework.messaging.simp.SimpMessagingTemplate

class WebSocketSubmissionEmitterTest : FunSpec({
    val messagingTemplate = mockk<SimpMessagingTemplate>(relaxed = true)

    val sut = WebSocketSubmissionEmitter(messagingTemplate)

    context("emit") {
        test("should send submission to the correct topic") {
            val submission = SubmissionMockFactory.build()
            val expectedTopic = "/topic/contests/${submission.contest.id}/submissions"

            sut.emitForContest(submission)

            verify {
                messagingTemplate.convertAndSend(expectedTopic, submission.toEmmitDTO())
            }
        }
    }
})
