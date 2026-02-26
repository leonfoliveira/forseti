package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.api.adapter.driven.socketio.SocketIOBroadcastEmitter
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.infrastructure.adapter.dto.message.RabbitMQMessage
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.verify
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
        val contestId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
        }

        test("should handle payload") {
            val payload =
                BroadcastEvent(
                    room = "/topic/any",
                    name = "ANY",
                    data = mapOf("foo" to "bar") as Serializable,
                )
            val message =
                RabbitMQMessage(
                    id = IdGenerator.getUUID(),
                    contestId = contestId,
                    traceId = IdGenerator.getTraceId(),
                    payload = payload,
                )
            val jsonMessage = objectMapper.writeValueAsString(message)

            sut.receiveMessage(jsonMessage)

            verify {
                socketIOBroadcastEmitter.emit(any())
            }
        }
    })
