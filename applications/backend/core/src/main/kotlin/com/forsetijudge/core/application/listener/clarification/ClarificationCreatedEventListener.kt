package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import com.forsetijudge.core.port.driven.broadcast.payload.BroadcastPayload
import com.forsetijudge.core.port.dto.response.clarification.toResponseBodyDTO
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

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardAdmin(clarification.contest.id),
                event = BroadcastEvent.CLARIFICATION_CREATED,
                body = clarification.toResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardContestant(clarification.contest.id),
                event = BroadcastEvent.CLARIFICATION_CREATED,
                body = clarification.toResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardGuest(clarification.contest.id),
                event = BroadcastEvent.CLARIFICATION_CREATED,
                body = clarification.toResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardJudge(clarification.contest.id),
                event = BroadcastEvent.CLARIFICATION_CREATED,
                body = clarification.toResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardStaff(clarification.contest.id),
                event = BroadcastEvent.CLARIFICATION_CREATED,
                body = clarification.toResponseBodyDTO(),
            ),
        )

        val parent = payload.parent
        if (parent != null) {
            broadcastProducer.produce(
                BroadcastPayload(
                    topic = BroadcastTopic.ContestsMembers(parent.contest.id, parent.member.id),
                    event = BroadcastEvent.CLARIFICATION_ANSWERED,
                    body = clarification.toResponseBodyDTO(),
                ),
            )
        }
    }
}
