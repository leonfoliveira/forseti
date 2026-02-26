package com.forsetijudge.core.application.listener.ticket

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.ContestantPrivateBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.JudgePrivateBroadcastRoom
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class TicketUpdatedEventListener(
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<TicketEvent.Updated>() {
    @TransactionalEventListener(TicketEvent.Updated::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: TicketEvent.Updated) {
        super.onApplicationEvent(event)
    }

    override fun handleEvent(event: TicketEvent.Updated) {
        val ticket = event.ticket
        val contest = ticket.contest

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildTicketUpdatedEvent(ticket))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildTicketUpdatedEvent(ticket))
        broadcastProducer.produce(ContestantPrivateBroadcastRoom(contest.id, ticket.member.id).buildTicketUpdatedEvent(ticket))
        broadcastProducer.produce(JudgePrivateBroadcastRoom(contest.id, ticket.member.id).buildTicketUpdatedEvent(ticket))
    }
}
