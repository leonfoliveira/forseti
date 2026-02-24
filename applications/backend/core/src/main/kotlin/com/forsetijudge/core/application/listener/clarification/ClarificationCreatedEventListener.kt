package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.dto.response.clarification.toResponseBodyDTO
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ClarificationCreatedEventListener(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) : BusinessEventListener<Clarification, ClarificationEvent.Created>() {
    @TransactionalEventListener(ClarificationEvent.Created::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: ClarificationEvent.Created) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Clarification) {
        val clarification = payload
        webSocketFanoutProducer.produce(
            WebSocketFanoutPayload(
                "/topic/contests/${clarification.contest.id}/clarifications",
                clarification.toResponseBodyDTO(),
            ),
        )

        val parent = clarification.parent
        if (parent != null) {
            webSocketFanoutProducer.produce(
                WebSocketFanoutPayload(
                    "/topic/contests/${clarification.contest.id}/members/${parent.member.id}/clarifications:answer",
                    clarification.toResponseBodyDTO(),
                ),
            )
        }
    }
}
