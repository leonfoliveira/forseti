package com.forsetijudge.core.application.listener.announcement

import com.forsetijudge.core.domain.entity.AnnouncementMockBuilder
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class AnnouncementCreatedEventListenerTest :
    FunSpec({
        val webSocketFanoutProducer = mockk<WebSocketFanoutProducer>(relaxed = true)

        val sut = AnnouncementCreatedEventListener(webSocketFanoutProducer = webSocketFanoutProducer)

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val announcement = AnnouncementMockBuilder.build()
            val event = AnnouncementEvent.Created(announcement)

            sut.onApplicationEvent(event)

            verify {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${announcement.id}/announcements",
                        announcement.toResponseBodyDTO(),
                    ),
                )
            }
        }
    })
