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
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ClarificationDeletedEventListener(
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<ClarificationEvent.Deleted>() {
    @TransactionalEventListener(ClarificationEvent.Deleted::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: ClarificationEvent.Deleted) {
        super.onApplicationEvent(event)
    }

    override fun handleEvent(event: ClarificationEvent.Deleted) {
        val clarification = event.clarification
        val contest = clarification.contest

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildClarificationDeletedEvent(clarification))
        broadcastProducer.produce(ContestantDashboardBroadcastRoom(contest.id).buildClarificationDeletedEvent(clarification))
        broadcastProducer.produce(GuestDashboardBroadcastRoom(contest.id).buildClarificationDeletedEvent(clarification))
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildClarificationDeletedEvent(clarification))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildClarificationDeletedEvent(clarification))
    }
}
