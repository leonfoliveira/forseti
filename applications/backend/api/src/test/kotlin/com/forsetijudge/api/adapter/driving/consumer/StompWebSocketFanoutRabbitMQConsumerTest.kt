package com.forsetijudge.api.adapter.driving.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driving.usecase.session.RefreshSessionUseCase
import com.forsetijudge.infrastructure.adapter.dto.message.RabbitMQMessage
import com.forsetijudge.infrastructure.adapter.dto.message.payload.WebSocketFanoutMessagePayload
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.messaging.simp.SimpMessagingTemplate
import java.io.Serializable

@SpringBootTest(classes = [StompWebSocketFanoutRabbitMQConsumer::class, JacksonConfig::class])
class StompWebSocketFanoutRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    private val refreshSessionUseCase: RefreshSessionUseCase,
    @MockkBean(relaxed = true)
    private val messagingTemplate: SimpMessagingTemplate,
    private val objectMapper: ObjectMapper,
    private val sut: StompWebSocketFanoutRabbitMQConsumer,
) : FunSpec({
        val event =
            RabbitMQMessage(
                payload =
                    WebSocketFanoutMessagePayload(
                        destination = "/topic/test",
                        payload = mapOf("key" to "value") as Serializable,
                    ),
            )
        val jsonEvent = objectMapper.writeValueAsString(event)

        test("should handle payload") {
            sut.receiveMessage(jsonEvent)

            verify { messagingTemplate.convertAndSend(event.payload.destination, event.payload.payload) }
        }
    })
