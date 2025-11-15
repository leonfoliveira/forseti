package io.github.leonfoliveira.forseti.api.application.listener

import io.github.leonfoliveira.forseti.api.application.port.driven.AnnouncementEmitter
import io.github.leonfoliveira.forseti.common.application.domain.event.AnnouncementCreatedEvent
import io.github.leonfoliveira.forseti.common.mock.entity.AnnouncementMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class AnnouncementEventListenerTest :
    FunSpec({
        val announcementEmitter = mockk<AnnouncementEmitter>(relaxed = true)

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
