package live.forseti.api.adapter.driven.emitter

import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import live.forseti.api.adapter.dto.response.announcement.toResponseDTO
import live.forseti.core.domain.entity.AnnouncementMockBuilder
import live.forseti.core.port.driven.WebSocketFanoutProducer
import org.springframework.messaging.simp.SimpMessagingTemplate

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
