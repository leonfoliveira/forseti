package com.forsetijudge.api.adapter.driving.listener

import com.forsetijudge.api.adapter.driven.emitter.StompAnnouncementEmitter
import com.forsetijudge.api.adapter.driving.listener.AnnouncementEventsApiListener
import com.forsetijudge.core.domain.entity.AnnouncementMockBuilder
import com.forsetijudge.core.domain.event.AnnouncementCreatedEvent
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

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
