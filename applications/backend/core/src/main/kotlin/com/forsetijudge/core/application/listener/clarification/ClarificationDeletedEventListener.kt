package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ClarificationDeletedEventListener(
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<ClarificationEvent.Deleted> {
    override fun handle(event: ClarificationEvent.Deleted) {
        broadcastProducer.produce(AdminDashboardBroadcastRoom(event.contestId).buildClarificationDeletedEvent(event.clarificationId))
        broadcastProducer.produce(ContestantDashboardBroadcastRoom(event.contestId).buildClarificationDeletedEvent(event.clarificationId))
        broadcastProducer.produce(GuestDashboardBroadcastRoom(event.contestId).buildClarificationDeletedEvent(event.clarificationId))
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(event.contestId).buildClarificationDeletedEvent(event.clarificationId))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(event.contestId).buildClarificationDeletedEvent(event.clarificationId))
    }
}
