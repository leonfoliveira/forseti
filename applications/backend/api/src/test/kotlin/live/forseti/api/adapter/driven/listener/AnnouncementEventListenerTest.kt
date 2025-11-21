package live.forseti.api.adapter.driven.listener

import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import live.forseti.api.adapter.driven.emitter.StompAnnouncementEmitter
import live.forseti.core.domain.entity.AnnouncementMockBuilder
import live.forseti.core.domain.event.AnnouncementCreatedEvent

class AnnouncementEventListenerTest :
    FunSpec({
        val announcementEmitter = mockk<StompAnnouncementEmitter>(relaxed = true)

        val sut = AnnouncementEventsApiListener(announcementEmitter)

        beforeEach {
            clearAllMocks()
        }

        test("should emit announcement on event") {
            val announcement = AnnouncementMockBuilder.build()
            val event = AnnouncementCreatedEvent(this, announcement)

            sut.onApplicationEvent(event)

            verify { announcementEmitter.emit(announcement) }
        }
    })
