package com.forsetijudge.api.adapter.driven.emitter

import com.forsetijudge.core.domain.entity.TicketMockBuilder
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import io.kotest.core.spec.style.FunSpec
import io.mockk.mockk
import io.mockk.verify
import java.io.Serializable

class StompTicketEmitterTest :
    FunSpec({
        val webSocketFanoutProducer = mockk<WebSocketFanoutProducer>(relaxed = true)

        val sut = StompTicketEmitter(webSocketFanoutProducer)

        test("should emit ticket to correct topics") {
            val ticket = TicketMockBuilder.build<Serializable>()

            sut.emit(ticket)

            verify {
                webSocketFanoutProducer.produce("/topic/contests/${ticket.contest.id}/tickets", any())
                webSocketFanoutProducer.produce("/topic/contests/${ticket.contest.id}/tickets/members/${ticket.member.id}", any())
            }
        }
    })
