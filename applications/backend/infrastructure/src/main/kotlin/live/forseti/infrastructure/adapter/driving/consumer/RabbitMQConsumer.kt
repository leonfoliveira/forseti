package live.forseti.infrastructure.adapter.driving.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import live.forseti.core.domain.model.RequestContext
import live.forseti.infrastructure.adapter.dto.message.RabbitMQMessage
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.beans.factory.annotation.Autowired
import java.io.Serializable
import java.util.UUID

abstract class RabbitMQConsumer<TPayload : Serializable> {
    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private val logger = LoggerFactory.getLogger(this::class.java)

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
                UUID.randomUUID().toString()
            }
        val payloadJson = jsonNode["payload"]

        val payload = objectMapper.treeToValue(payloadJson, getPayloadType())
        val message = RabbitMQMessage(id, traceId, payload)

        RequestContext.Companion.getContext().traceId = traceId
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

    /**
     * Method to get the payload type for deserialization.
     */
    protected abstract fun getPayloadType(): Class<TPayload>

    /**
     * Method to handle the payload after deserialization.
     */
    protected abstract fun handlePayload(payload: TPayload)
}
