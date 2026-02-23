package com.forsetijudge.core.application.listener.ticket

import com.forsetijudge.core.domain.entity.TicketMockBuilder
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import java.io.Serializable

class TicketCreatedEventListenerTest :
    FunSpec({
        val webSocketFanoutProducer = mockk<WebSocketFanoutProducer>(relaxed = true)

        val sut = TicketCreatedEventListener(webSocketFanoutProducer = webSocketFanoutProducer)

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val ticket = TicketMockBuilder.build<Serializable>()
            val event = TicketEvent.Created(ticket)

            sut.onApplicationEvent(event)

            verify {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${ticket.contest.id}/tickets",
                        ticket.toResponseBodyDTO(),
                    ),
                )
            }
            verify {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${ticket.contest.id}/members/${ticket.member.id}/tickets",
                        ticket.toResponseBodyDTO(),
                    ),
                )
            }
        }
    })
