package com.forsetijudge.core.application.service.internal.outbox

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.OutboxEvent
import com.forsetijudge.core.port.driven.repository.OutboxEventRepository
import com.forsetijudge.core.port.driving.usecase.internal.outbox.PublishOutboxEventInternalUseCase
import org.springframework.stereotype.Service

@Service
class PublishOutboxEventInternalService(
    private val outboxEventRepository: OutboxEventRepository,
    private val objectMapper: ObjectMapper,
) : PublishOutboxEventInternalUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(command: PublishOutboxEventInternalUseCase.Command) {
        logger.info("Publishing outbox event: ${command.event}")

        val outboxEvent =
            OutboxEvent(
                eventType = command.event::class.java.name,
                payload = objectMapper.writeValueAsString(command.event),
            )

        outboxEventRepository.save(outboxEvent)
        logger.info("Successfully published outbox event with id: ${outboxEvent.id} and type: ${outboxEvent.eventType}")
    }
}
