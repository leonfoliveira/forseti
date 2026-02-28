package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.api.adapter.driven.socketio.SocketIOBroadcastEmitter
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.RabbitMQMessage
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.SubmissionQueueMessageBody
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.amqp.core.Message
import org.springframework.boot.test.context.SpringBootTest
import java.io.Serializable

@SpringBootTest(classes = [SocketIOFanoutRabbitMQConsumer::class, JacksonConfig::class])
class SocketIOFanoutRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val socketIOBroadcastEmitter: SocketIOBroadcastEmitter,
    private val objectMapper: ObjectMapper,
    private val sut: SocketIOFanoutRabbitMQConsumer,
) : FunSpec({

        beforeEach {
            clearAllMocks()
        }

        test("should handle payload") {
            val event =
                BroadcastEvent(
                    room = "/topic/any",
                    name = "ANY",
                    data = mapOf("foo" to "bar") as Serializable,
                )
            val message = mockk<Message>(relaxed = true)
            every { message.messageProperties.headers } returns mapOf("id" to IdGenerator.getUUID().toString())
            every { message.body } returns objectMapper.writeValueAsBytes(event)

            sut.receiveMessage(message)

            verify {
                socketIOBroadcastEmitter.emit(any())
            }
        }
    })
