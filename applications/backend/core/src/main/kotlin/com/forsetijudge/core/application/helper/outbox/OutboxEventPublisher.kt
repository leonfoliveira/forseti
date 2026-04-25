package com.forsetijudge.core.application.helper.outbox

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.OutboxEvent
import com.forsetijudge.core.domain.event.BusinessEvent
import com.forsetijudge.core.port.driven.repository.OutboxEventRepository
import org.springframework.stereotype.Service

@Service
class OutboxEventPublisher(
    private val outboxEventRepository: OutboxEventRepository,
    private val objectMapper: ObjectMapper,
) {
    private val logger = SafeLogger(this::class)

    fun publish(event: BusinessEvent) {
        logger.info("Publishing outbox event: $event")

        val outboxEvent =
            OutboxEvent(
                eventType = event::class.java.name,
                payload = objectMapper.writeValueAsString(event),
            )

        outboxEventRepository.save(outboxEvent)
        logger.info("Successfully published outbox event with id: ${outboxEvent.id} and type: ${outboxEvent.eventType}")
    }
}
