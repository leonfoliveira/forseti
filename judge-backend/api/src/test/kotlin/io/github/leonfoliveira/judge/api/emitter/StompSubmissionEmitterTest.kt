package io.github.leonfoliveira.judge.api.emitter

import io.github.leonfoliveira.judge.api.dto.response.submission.toFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toPublicResponseDTO
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import org.springframework.messaging.simp.SimpMessagingTemplate

class StompSubmissionEmitterTest : FunSpec({
    val messagingTemplate = mockk<SimpMessagingTemplate>(relaxed = true)

    val sut =
        StompSubmissionEmitter(
            messagingTemplate = messagingTemplate,
        )

    beforeEach {
        clearAllMocks()
    }

    test("should emmit submission events") {
        val submission = SubmissionMockBuilder.build()

        sut.emit(submission)

        verify {
            messagingTemplate.convertAndSend(
                "/topic/contests/${submission.contest.id}/submissions",
                submission.toPublicResponseDTO(),
            )
        }
        verify {
            messagingTemplate.convertAndSend(
                "/topic/contests/${submission.contest.id}/submissions/full",
                submission.toFullResponseDTO(),
            )
        }
        verify {
            messagingTemplate.convertAndSend(
                "/topic/contests/${submission.contest.id}/submissions/full/members/${submission.member.id}",
                submission.toFullResponseDTO(),
            )
        }
    }
})
