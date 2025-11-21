package io.github.leonfoliveira.forseti.api.adapter.driven.emitter

import io.github.leonfoliveira.forseti.api.adapter.dto.response.clarification.toResponseDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import live.forseti.core.domain.entity.ClarificationMockBuilder
import org.springframework.messaging.simp.SimpMessagingTemplate
import java.time.OffsetDateTime

class StompClarificationEmitterTest :
    FunSpec({
        val messagingTemplate = mockk<SimpMessagingTemplate>(relaxed = true)

        val sut = StompClarificationEmitter(messagingTemplate)

        beforeTest {
            clearAllMocks()
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
                    "/topic/contests/${clarification.contest.id}/clarifications/children/members/${clarification.parent!!.member.id}",
                    clarification.toResponseDTO(),
                )
            }
        }

        test("should emit clarification deleted events") {
            val clarification = ClarificationMockBuilder.build(deletedAt = OffsetDateTime.now())

            sut.emitDeleted(clarification)

            verify {
                messagingTemplate.convertAndSend(
                    "/topic/contests/${clarification.contest.id}/clarifications/deleted",
                    mapOf("id" to clarification.id),
                )
            }
        }
    })
