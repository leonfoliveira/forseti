package io.github.leonfoliveira.forseti.api.listener

import io.github.leonfoliveira.forseti.api.emitter.StompAnnouncementEmitter
import io.github.leonfoliveira.forseti.common.domain.event.AnnouncementCreatedEvent
import io.github.leonfoliveira.forseti.common.mock.entity.AnnouncementMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class AnnouncementEventListenerTest :
    FunSpec({
        val stompAnnouncementEmitter = mockk<StompAnnouncementEmitter>(relaxed = true)

        val sut = AnnouncementEventsApiListener(stompAnnouncementEmitter)

        beforeEach {
            clearAllMocks()
        }

        test("should emit announcement on event") {
            val announcement = AnnouncementMockBuilder.build()
            val event = AnnouncementCreatedEvent(this, announcement)

            sut.onApplicationEvent(event)

            verify { stompAnnouncementEmitter.emit(announcement) }
        }
    })
