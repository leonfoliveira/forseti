package com.forsetijudge.core.application.service.external.outbox

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.OutboxEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.OutboxEventRepository
import com.forsetijudge.core.port.driving.usecase.external.outbox.ExecuteOutboxEventUseCase
import org.springframework.core.GenericTypeResolver
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ExecuteOutboxEventService(
    private val outboxEventRepository: OutboxEventRepository,
    private val objectMapper: ObjectMapper,
    listener: List<BusinessEventListener<*>>,
) : ExecuteOutboxEventUseCase {
    private val logger = SafeLogger(this::class)

    private val listenerByType =
        listener.associateBy { listener ->
            GenericTypeResolver.resolveTypeArgument(listener::class.java, BusinessEventListener::class.java).name
        }

    @Transactional
    override fun execute(command: ExecuteOutboxEventUseCase.Command) {
        logger.info("Executing outbox event with id: ${command.id}")

        val outboxEvent =
            outboxEventRepository.findById(command.id)
                ?: throw NotFoundException("Could not find outbox event with id: ${command.id}")

        if (outboxEvent.status != OutboxEvent.Status.PENDING) {
            logger.warn("Outbox event with id ${command.id} is not pending, status = ${outboxEvent.status}.")
            return
        }

        val listener = listenerByType[outboxEvent.eventType]
        if (listener == null) {
            logger.warn("No listener found for outbox event with id ${command.id} and type ${outboxEvent.eventType}.")
            return
        }

        val eventType = GenericTypeResolver.resolveTypeArgument(listener::class.java, BusinessEventListener::class.java)!!
        val event = objectMapper.readValue(outboxEvent.payload, eventType)
        @Suppress("UNCHECKED_CAST")
        (listener as BusinessEventListener<Any>).handle(event)

        outboxEvent.status = OutboxEvent.Status.PROCESSED
        outboxEventRepository.save(outboxEvent)

        logger.info("Successfully executed outbox event with id: ${command.id}")
    }
}
