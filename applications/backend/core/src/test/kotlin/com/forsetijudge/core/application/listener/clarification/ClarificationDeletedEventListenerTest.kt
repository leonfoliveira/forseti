package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.domain.entity.ClarificationMockBuilder
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.dto.response.clarification.toIdResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class ClarificationDeletedEventListenerTest :
    FunSpec({
        val webSocketFanoutProducer = mockk<WebSocketFanoutProducer>(relaxed = true)

        val sut = ClarificationDeletedEventListener(webSocketFanoutProducer = webSocketFanoutProducer)

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val clarification = ClarificationMockBuilder.build()
            val event = ClarificationEvent.Deleted(clarification = clarification)

            sut.onApplicationEvent(event)

            verify {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${clarification.contestId}/clarifications:delete",
                        clarification.toIdResponseBodyDTO(),
                    ),
                )
            }
        }
    })
