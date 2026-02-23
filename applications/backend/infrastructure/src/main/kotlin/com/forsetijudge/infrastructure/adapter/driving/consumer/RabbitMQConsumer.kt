package com.forsetijudge.infrastructure.adapter.driving.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.SessionCache
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import io.opentelemetry.api.trace.Span
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import java.io.Serializable
import java.util.UUID

abstract class RabbitMQConsumer<TPayload : Serializable> {
    @Value("\${security.member-login}")
    private lateinit var memberLogin: String

    @Value("\${security.member-type}")
    private lateinit var memberType: Member.Type

    @Autowired
    private lateinit var authenticateSystemUseCase: AuthenticateSystemUseCase

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    protected val logger: Logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Method to receive a message from RabbitMQ, deserialize it, and handle the payload.
     * It also loads the traceId into the RequestContext to keep track of the entire information flow.
     */
    open fun receiveMessage(jsonMessage: String) {
        ExecutionContext.start()

        val jsonNode = objectMapper.readTree(jsonMessage)
        val id = UUID.fromString(jsonNode["id"].asText())
        val contestId = jsonNode["contestId"]?.asText()?.let { UUID.fromString(it) }
        val payloadJson = jsonNode["payload"]

        val payload = objectMapper.treeToValue(payloadJson, getPayloadType())

        ExecutionContext.get().contestId = contestId

        authenticateSystemUseCase.execute(
            AuthenticateSystemUseCase.Command(
                login = memberLogin,
                type = memberType,
            ),
        )

        logger.info("Received message: {}", jsonMessage)

        try {
            logger.info("Handling message with id: {}", id)
            handlePayload(payload)
            logger.info("Finished handling message")
        } catch (ex: Exception) {
            logger.error("Error thrown from consumer {}: {}", this.javaClass.simpleName, ex.message)
            throw ex
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
