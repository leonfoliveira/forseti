package live.forseti.api.adapter.driven.emitter

import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import live.forseti.api.adapter.dto.response.clarification.toResponseDTO
import live.forseti.core.domain.entity.ClarificationMockBuilder
import live.forseti.core.port.driven.WebSocketFanoutProducer
import java.io.Serializable
import java.time.OffsetDateTime

class StompClarificationEmitterTest :
    FunSpec({
        val webSocketFanoutProducer = mockk<WebSocketFanoutProducer>(relaxed = true)

        val sut = StompClarificationEmitter(webSocketFanoutProducer)

        beforeTest {
            clearAllMocks()
        }

        test("should emmit clarification events") {
            val clarification = ClarificationMockBuilder.build()

            sut.emit(clarification)

            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/${clarification.contest.id}/clarifications",
                    clarification.toResponseDTO(),
                )
            }
        }

        test("should emmit clarification children events") {
            val clarification = ClarificationMockBuilder.build(parent = ClarificationMockBuilder.build())

            sut.emit(clarification)

            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/${clarification.contest.id}/clarifications/children/members/${clarification.parent!!.member.id}",
                    clarification.toResponseDTO(),
                )
            }
        }

        test("should emmit clarification deleted events") {
            val clarification = ClarificationMockBuilder.build(deletedAt = OffsetDateTime.now())

            sut.emitDeleted(clarification)

            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/${clarification.contest.id}/clarifications/deleted",
                    mapOf("id" to clarification.id) as Serializable,
                )
            }
        }
    })
