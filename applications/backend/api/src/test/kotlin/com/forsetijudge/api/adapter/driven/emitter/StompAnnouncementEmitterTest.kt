package com.forsetijudge.api.adapter.driven.emitter

import com.forsetijudge.api.adapter.dto.response.announcement.toResponseDTO
import com.forsetijudge.core.domain.entity.AnnouncementMockBuilder
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class StompAnnouncementEmitterTest :
    FunSpec({
        val webSocketFanoutProducer = mockk<WebSocketFanoutProducer>(relaxed = true)

        val sut = StompAnnouncementEmitter(webSocketFanoutProducer)

        beforeEach {
            clearAllMocks()
        }

        test("should emmit announcement events") {
            val announcement = AnnouncementMockBuilder.build()

            sut.emit(announcement)

            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/${announcement.contest.id}/announcements",
                    announcement.toResponseDTO(),
                )
            }
        }
    })
