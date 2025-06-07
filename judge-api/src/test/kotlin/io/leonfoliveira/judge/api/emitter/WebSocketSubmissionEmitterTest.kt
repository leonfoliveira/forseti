package io.leonfoliveira.judge.api.emitter

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.dto.response.toFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.toPublicResponseDTO
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.mockk.mockk
import io.mockk.verify
import org.springframework.messaging.simp.SimpMessagingTemplate

class WebSocketSubmissionEmitterTest : FunSpec({
    val messagingTemplate = mockk<SimpMessagingTemplate>(relaxed = true)

    val sut = WebSocketSubmissionEmitter(messagingTemplate)

    test("should send submission to the contest topic") {
        val submission = SubmissionMockFactory.build()
        val expectedTopic = "/topic/contests/${submission.contest.id}/submissions"

        sut.emitForContest(submission)

        verify {
            messagingTemplate.convertAndSend(expectedTopic, submission.toPublicResponseDTO())
            messagingTemplate.convertAndSend(
                "/topic/contests/${submission.contest.id}/submissions/full",
                submission.toFullResponseDTO(),
            )
        }
    }

    test("should send submission to the member topic") {
        val submission = SubmissionMockFactory.build()
        val expectedTopic = "/topic/members/${submission.member.id}/submissions"

        sut.emitForMember(submission)

        verify {
            messagingTemplate.convertAndSend(expectedTopic, submission.toPublicResponseDTO())
        }
    }
})
