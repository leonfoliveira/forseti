package com.forsetijudge.core.application.listener.ticket

import com.forsetijudge.core.domain.entity.TicketMockBuilder
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.repository.TicketRepository
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.io.Serializable

class TicketCreatedEventListenerTest :
    FunSpec({
        val ticketRepository = mockk<TicketRepository>(relaxed = true)
        val broadcastProducer = mockk<BroadcastProducer>(relaxed = true)

        val sut =
            TicketCreatedEventListener(
                ticketRepository = ticketRepository,
                broadcastProducer = broadcastProducer,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val ticket = TicketMockBuilder.build<Serializable>()
            val event = TicketEvent.Created(ticket.id)
            every { ticketRepository.findById(ticket.id) } returns ticket

            sut.handle(event)

            verify { broadcastProducer.produce(AdminDashboardBroadcastRoom(ticket.contest.id).buildTicketCreatedEvent(ticket)) }
            verify { broadcastProducer.produce(StaffDashboardBroadcastRoom(ticket.contest.id).buildTicketCreatedEvent(ticket)) }
        }
    })
