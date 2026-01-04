package com.forsetijudge.infrastructure.adapter.driving.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.session.RefreshSessionUseCase
import com.forsetijudge.infrastructure.adapter.dto.message.RabbitMQMessage
import com.github.f4b6a3.uuid.UuidCreator
import io.opentelemetry.api.trace.Span
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import java.io.Serializable
import java.util.UUID

abstract class RabbitMQConsumer<TPayload : Serializable>(
    private val memberId: UUID,
) {
    @Autowired
    private lateinit var refreshSessionUseCase: RefreshSessionUseCase

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    protected val logger: Logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Method to receive a message from RabbitMQ, deserialize it, and handle the payload.
     * It also loads the traceId into the RequestContext to keep track of the entire information flow.
     */
    open fun receiveMessage(jsonMessage: String) {
        logger.info("Received message: {}", jsonMessage)

        val jsonNode = objectMapper.readTree(jsonMessage)
        val id = UUID.fromString(jsonNode["id"].asText())
        val traceId =
            if (jsonNode.has("traceId") && !jsonNode["traceId"].isNull) {
                jsonNode["traceId"].asText()
            } else {
                UuidCreator.getTimeOrderedEpoch().toString()
            }
        val payloadJson = jsonNode["payload"]

        val payload = objectMapper.treeToValue(payloadJson, getPayloadType())
        val message = RabbitMQMessage(id, traceId, payload)

        initRequestContext()

        try {
            handlePayload(message.payload)
        } catch (ex: Exception) {
            logger.error("Error thrown from consumer {}: {}", this.javaClass.simpleName, ex.message)
            throw ex
        }
    }

    private fun initRequestContext() {
        val session = refreshSessionUseCase.refresh(memberId)
        RequestContext.getContext().session = session
        RequestContext.getContext().traceId = Span.current().spanContext.traceId
    }

    /**
     * Method to get the payload type for deserialization.
     */
    protected abstract fun getPayloadType(): Class<TPayload>

    /**
     * Method to handle the payload after deserialization.
     */
    protected abstract fun handlePayload(payload: TPayload)
}
