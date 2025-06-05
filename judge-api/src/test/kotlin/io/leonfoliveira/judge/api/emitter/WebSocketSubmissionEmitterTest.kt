package io.leonfoliveira.judge.api.emitter

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.emitter.dto.emmit.toEmmitDTO
import io.leonfoliveira.judge.api.emitter.dto.emmit.toPrivateEmmitDTO
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
            messagingTemplate.convertAndSend(expectedTopic, submission.toEmmitDTO())
            messagingTemplate.convertAndSend(
                "/topic/contests/${submission.contest.id}/submissions/judge",
                submission.toPrivateEmmitDTO(),
            )
        }
    }

    test("should send submission to the member topic") {
        val submission = SubmissionMockFactory.build()
        val expectedTopic = "/topic/members/${submission.member.id}/submissions"

        sut.emitForMember(submission)

        verify {
            messagingTemplate.convertAndSend(expectedTopic, submission.toPrivateEmmitDTO())
        }
    }

    test("should send failed submission to the contest topic") {
        val submission = SubmissionMockFactory.build()
        val expectedTopic = "/topic/contests/${submission.contest.id}/submissions/fail"

        sut.emitFail(submission)

        verify {
            messagingTemplate.convertAndSend(expectedTopic, submission.toEmmitDTO())
        }
    }
})
