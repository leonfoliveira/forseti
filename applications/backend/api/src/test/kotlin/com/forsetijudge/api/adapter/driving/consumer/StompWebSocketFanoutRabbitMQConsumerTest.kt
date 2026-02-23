package com.forsetijudge.api.adapter.driving.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.application.util.SessionCache
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import com.forsetijudge.infrastructure.adapter.dto.message.RabbitMQMessage
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.messaging.simp.SimpMessagingTemplate
import java.io.Serializable

@SpringBootTest(classes = [StompWebSocketFanoutRabbitMQConsumer::class, JacksonConfig::class])
class StompWebSocketFanoutRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    private val sessionCache: SessionCache,
    @MockkBean(relaxed = true)
    private val messagingTemplate: SimpMessagingTemplate,
    private val objectMapper: ObjectMapper,
    private val sut: StompWebSocketFanoutRabbitMQConsumer,
) : FunSpec({
        val session = SessionMockBuilder.build()
        val contestId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            every { sessionCache.get(contestId, Member.API_ID) } returns session.toResponseBodyDTO()
        }

        test("should handle payload") {
            val message =
                RabbitMQMessage(
                    id = IdGenerator.getUUID(),
                    contestId = contestId,
                    traceId = IdGenerator.getTraceId(),
                    payload =
                        WebSocketFanoutPayload(
                            destination = "/topic/any",
                            body = mapOf("foo" to "bar") as Serializable,
                        ),
                )
            val jsonMessage = objectMapper.writeValueAsString(message)

            sut.receiveMessage(jsonMessage)

            verify {
                messagingTemplate.convertAndSend(message.payload.destination, message.payload.body as Serializable)
            }
        }

        test("should handle without body") {
            val message =
                RabbitMQMessage(
                    id = IdGenerator.getUUID(),
                    contestId = contestId,
                    traceId = IdGenerator.getTraceId(),
                    payload =
                        WebSocketFanoutPayload(
                            destination = "/topic/any",
                            body = null,
                        ),
                )
            val jsonMessage = objectMapper.writeValueAsString(message)

            sut.receiveMessage(jsonMessage)

            verify {
                messagingTemplate.convertAndSend(message.payload.destination)
            }
        }
    })
