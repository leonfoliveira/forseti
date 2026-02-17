package com.forsetijudge.api.adapter.driving.listener

import com.forsetijudge.api.adapter.driven.emitter.StompTicketEmitter
import com.forsetijudge.core.domain.entity.TicketMockBuilder
import com.forsetijudge.core.domain.event.TicketCreatedEvent
import com.forsetijudge.core.domain.event.TicketUpdatedEvent
import io.kotest.core.spec.style.FunSpec
import io.mockk.mockk
import io.mockk.verify
import java.io.Serializable

class TicketEventsApiListenerTest :
    FunSpec({
        val ticketEmitter = mockk<StompTicketEmitter>(relaxed = true)

        val sut = TicketEventsApiListener(ticketEmitter)

        test("should emit ticket on TicketCreatedEvent") {
            val ticket = TicketMockBuilder.build<Serializable>()
            val event = TicketCreatedEvent(this, ticket)

            sut.onApplicationEvent(event)

            verify { ticketEmitter.emit(ticket) }
        }

        test("should emit ticket on TicketUpdatedEvent") {
            val ticket = TicketMockBuilder.build<Serializable>()
            val event = TicketUpdatedEvent(this, ticket)

            sut.onApplicationEvent(event)

            verify { ticketEmitter.emit(ticket) }
        }
    })
