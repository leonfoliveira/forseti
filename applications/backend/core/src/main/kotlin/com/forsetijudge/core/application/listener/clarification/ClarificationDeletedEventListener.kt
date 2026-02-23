package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.dto.response.clarification.toIdResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

class ClarificationDeletedEventListener(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) : BusinessEventListener<ClarificationEvent.Deleted> {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(ClarificationEvent.Deleted::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: ClarificationEvent.Deleted) {
        logger.info("Handling clarification deleted event with id: {}", event.payload.id)

        val clarification = event.payload
        webSocketFanoutProducer.produce(
            WebSocketFanoutPayload(
                "/topic/contests/${clarification.contestId}/clarifications:delete",
                clarification.toIdResponseBodyDTO(),
            ),
        )
    }
}
