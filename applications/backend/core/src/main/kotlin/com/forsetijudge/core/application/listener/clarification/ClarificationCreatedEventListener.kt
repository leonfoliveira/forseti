package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.dto.response.clarification.toResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

class ClarificationCreatedEventListener(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) : BusinessEventListener<ClarificationEvent.Created> {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(ClarificationEvent.Created::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: ClarificationEvent.Created) {
        logger.info("Handling clarification created event with id: {}", event.payload.id)

        val clarification = event.payload
        webSocketFanoutProducer.produce(
            WebSocketFanoutPayload(
                "/topic/contests/${clarification.contestId}/clarifications",
                clarification.toResponseBodyDTO(),
            ),
        )

        val parent = clarification.parent
        if (parent != null) {
            webSocketFanoutProducer.produce(
                WebSocketFanoutPayload(
                    "/topic/contests/${clarification.contestId}/members/${parent.memberId}/clarifications:answer",
                    clarification.toResponseBodyDTO(),
                ),
            )
        }
    }
}
