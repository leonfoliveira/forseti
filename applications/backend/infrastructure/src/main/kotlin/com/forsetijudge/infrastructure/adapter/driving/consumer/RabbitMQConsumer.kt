package com.forsetijudge.infrastructure.adapter.driving.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import org.springframework.amqp.core.Message
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import java.io.Serializable
import java.util.UUID

abstract class RabbitMQConsumer<TBody : Serializable> {
    @Value("\${security.member-login}")
    private lateinit var memberLogin: String

    @Value("\${security.member-type}")
    private lateinit var memberType: Member.Type

    @Autowired
    private lateinit var authenticateSystemUseCase: AuthenticateSystemUseCase

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    protected val logger = SafeLogger(this::class)

    open fun receiveMessage(message: Message) {
        val id = UUID.fromString(message.messageProperties.headers["id"] as String)
        val contestId = (message.messageProperties.headers["contest-id"] as? String).let { UUID.fromString(it) }
        val body = objectMapper.readValue(message.body, getBodyType())

        ExecutionContext.start(contestId = contestId)

        logger.info("Received message with id: $id and body: $body")

        authenticateSystemUseCase.execute(
            AuthenticateSystemUseCase.Command(
                login = memberLogin,
                type = memberType,
            ),
        )

        try {
            logger.info("Starting to handle message")
            handleBody(body)
            logger.info("Finished handling message")
        } catch (ex: Exception) {
            logger.error("Error thrown from consumer ${this.javaClass.simpleName}: ${ex.message}")
            throw ex
        }
    }

    protected abstract fun getBodyType(): Class<TBody>

    protected abstract fun handleBody(body: TBody)
}
