package io.github.leonfoliveira.judge.common.adapter.rabbitmq

import com.fasterxml.jackson.databind.ObjectMapper
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.message.RabbitMQMessage
import io.github.leonfoliveira.judge.common.domain.model.RequestContext
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.beans.factory.annotation.Autowired
import java.io.Serializable
import java.util.UUID

abstract class RabbitMQConsumer<TPayload : Serializable> {
    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private val logger = LoggerFactory.getLogger(this::class.java)

    @Transactional
    open fun receiveMessage(jsonMessage: String) {
        logger.info("Received message: {}", jsonMessage)

        val jsonNode = objectMapper.readTree(jsonMessage)
        val id = UUID.fromString(jsonNode["id"].asText())
        val traceId =
            if (jsonNode.has("traceId") && !jsonNode["traceId"].isNull) {
                jsonNode["traceId"].asText()
            } else {
                UUID.randomUUID().toString()
            }
        val payloadJson = jsonNode["payload"]

        val payload = objectMapper.treeToValue(payloadJson, getPayloadType())
        val message = RabbitMQMessage(id, traceId, payload)

        RequestContext.getCurrent().traceId = traceId
        MDC.put("traceId", traceId)

        try {
            handlePayload(message.payload)
        } catch (ex: Exception) {
            logger.error("Error thrown from consumer {}: {}", this.javaClass.simpleName, ex.message)
            throw ex
        } finally {
            MDC.clear()
        }
    }

    protected abstract fun getPayloadType(): Class<TPayload>

    protected abstract fun handlePayload(payload: TPayload)
}
