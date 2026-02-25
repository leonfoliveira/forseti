package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.ContestantPrivateBroadcastRoom
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ClarificationCreatedEventListener(
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<Clarification, ClarificationEvent.Created>() {
    @TransactionalEventListener(ClarificationEvent.Created::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: ClarificationEvent.Created) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Clarification) {
        val clarification = payload

        broadcastProducer.produce(AdminDashboardBroadcastRoom(clarification.contest.id).buildClarificationCreatedEvent(clarification))
        broadcastProducer.produce(ContestantDashboardBroadcastRoom(clarification.contest.id).buildClarificationCreatedEvent(clarification))
        broadcastProducer.produce(GuestDashboardBroadcastRoom(clarification.contest.id).buildClarificationCreatedEvent(clarification))
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(clarification.contest.id).buildClarificationCreatedEvent(clarification))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(clarification.contest.id).buildClarificationCreatedEvent(clarification))
        val parent = clarification.parent
        if (parent != null) {
            broadcastProducer.produce(
                ContestantPrivateBroadcastRoom(parent.member.id).buildClarificationAnsweredEvent(
                    clarification,
                ),
            )
        }
    }
}
