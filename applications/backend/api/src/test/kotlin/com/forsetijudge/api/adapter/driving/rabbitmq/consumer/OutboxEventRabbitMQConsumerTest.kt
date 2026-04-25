package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.helper.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.driving.usecase.external.outbox.ExecuteOutboxEventUseCase
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.BusinessEventQueueMessageBody
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.amqp.core.Message
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(classes = [OutboxEventRabbitMQConsumer::class, JacksonConfig::class])
class OutboxEventRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val executeOutboxEventUseCase: ExecuteOutboxEventUseCase,
    private val objectMapper: ObjectMapper,
    private val sut: OutboxEventRabbitMQConsumer,
) : FunSpec({
        val message = mockk<Message>(relaxed = true)
        val eventId = IdGenerator.getUUID()
        every { message.messageProperties.headers } returns
            mapOf(
                "id" to IdGenerator.getUUID().toString(),
                "contest-id" to IdGenerator.getUUID().toString(),
            )
        every { message.body } returns
            objectMapper.writeValueAsBytes(
                BusinessEventQueueMessageBody(
                    id = eventId,
                ),
            )

        test("should handle payload") {
            sut.receiveMessage(message)

            verify {
                executeOutboxEventUseCase.execute(
                    ExecuteOutboxEventUseCase.Command(
                        id = eventId,
                    ),
                )
            }
        }
    })
