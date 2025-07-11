package io.github.leonfoliveira.judge.api.emitter

import io.github.leonfoliveira.judge.api.dto.response.clarification.toResponseDTO
import io.github.leonfoliveira.judge.common.mock.entity.ClarificationMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime
import org.springframework.messaging.simp.SimpMessagingTemplate

class StompClarificationEmitterTest : FunSpec({
    val messagingTemplate = mockk<SimpMessagingTemplate>(relaxed = true)

    val sut = StompClarificationEmitter(messagingTemplate)

    beforeTest {
        clearAllMocks()
    }

    test("should emit clarification deleted events") {
        val clarification = ClarificationMockBuilder.build(deletedAt = OffsetDateTime.now())

        sut.emit(clarification)

        verify {
            messagingTemplate.convertAndSend(
                "/topic/contests/${clarification.contest.id}/clarifications/deleted",
                mapOf("id" to clarification.id),
            )
        }
    }

    test("should emit clarification events") {
        val clarification = ClarificationMockBuilder.build()

        sut.emit(clarification)

        verify {
            messagingTemplate.convertAndSend(
                "/topic/contests/${clarification.contest.id}/clarifications",
                clarification.toResponseDTO(),
            )
        }
    }

    test("should emit clarification children events") {
        val clarification = ClarificationMockBuilder.build(parent = ClarificationMockBuilder.build())

        sut.emit(clarification)

        verify {
            messagingTemplate.convertAndSend(
                "/topic/members/${clarification.parent!!.member.id}/clarifications/children",
                clarification.toResponseDTO(),
            )
        }
    }
})
