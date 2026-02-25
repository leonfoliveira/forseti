package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import com.forsetijudge.core.port.driven.broadcast.payload.BroadcastPayload
import com.forsetijudge.core.port.dto.response.clarification.toIdResponseBodyDTO
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ClarificationDeletedEventListener(
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<Clarification, ClarificationEvent.Deleted>() {
    @TransactionalEventListener(ClarificationEvent.Deleted::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: ClarificationEvent.Deleted) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Clarification) {
        val clarification = payload

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardAdmin(clarification.contest.id),
                event = BroadcastEvent.CLARIFICATION_DELETED,
                body = clarification.toIdResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardContestant(clarification.contest.id),
                event = BroadcastEvent.CLARIFICATION_DELETED,
                body = clarification.toIdResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardGuest(clarification.contest.id),
                event = BroadcastEvent.CLARIFICATION_DELETED,
                body = clarification.toIdResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardJudge(clarification.contest.id),
                event = BroadcastEvent.CLARIFICATION_DELETED,
                body = clarification.toIdResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardStaff(clarification.contest.id),
                event = BroadcastEvent.CLARIFICATION_DELETED,
                body = clarification.toIdResponseBodyDTO(),
            ),
        )
    }
}
