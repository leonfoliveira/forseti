package io.github.leonfoliveira.forseti.api.emitter

import io.github.leonfoliveira.forseti.api.dto.response.announcement.toResponseDTO
import io.github.leonfoliveira.forseti.common.mock.entity.AnnouncementMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import org.springframework.messaging.simp.SimpMessagingTemplate

class StompAnnouncementEmitterTest :
    FunSpec({
        val messagingTemplate = mockk<SimpMessagingTemplate>(relaxed = true)

        val sut = StompAnnouncementEmitter(messagingTemplate)

        beforeEach {
            clearAllMocks()
        }

        test("should emmit announcement events") {
            val announcement = AnnouncementMockBuilder.build()

            sut.emit(announcement)

            verify {
                messagingTemplate.convertAndSend(
                    "/topic/contests/${announcement.contest.id}/announcements",
                    announcement.toResponseDTO(),
                )
            }
        }
    })
