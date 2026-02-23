package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.domain.entity.ClarificationMockBuilder
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.dto.response.clarification.toResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class ClarificationCreatedEventListenerTest :
    FunSpec({
        val webSocketFanoutProducer = mockk<WebSocketFanoutProducer>(relaxed = true)

        val sut = ClarificationCreatedEventListener(webSocketFanoutProducer = webSocketFanoutProducer)

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully without parent") {
            val clarification = ClarificationMockBuilder.build(parent = null)
            val event = ClarificationEvent.Created(clarification = clarification)

            sut.onApplicationEvent(event)

            verify {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${clarification.contestId}/clarifications",
                        clarification.toResponseBodyDTO(),
                    ),
                )
            }
        }

        test("should handle event successfully with parent") {
            val parentClarification = ClarificationMockBuilder.build(parent = null)
            val clarification = ClarificationMockBuilder.build(parent = parentClarification)
            val event = ClarificationEvent.Created(clarification = clarification)

            sut.onApplicationEvent(event)

            verify {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${clarification.contestId}/clarifications",
                        clarification.toResponseBodyDTO(),
                    ),
                )
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${clarification.contestId}/members/${parentClarification.memberId}/clarifications:answer",
                        clarification.toResponseBodyDTO(),
                    ),
                )
            }
        }
    })
