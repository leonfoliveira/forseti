package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.api.emitter.StompAnnouncementEmitter
import io.github.leonfoliveira.judge.common.event.AnnouncementEvent
import io.github.leonfoliveira.judge.common.mock.entity.AnnouncementMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class AnnouncementEventListenerTest : FunSpec({
    val stompAnnouncementEmitter = mockk<StompAnnouncementEmitter>(relaxed = true)

    val sut = AnnouncementEventListener(stompAnnouncementEmitter)

    beforeEach {
        clearAllMocks()
    }

    test("should emit announcement on event") {
        val announcement = AnnouncementMockBuilder.build()
        val event = AnnouncementEvent(this, announcement)

        sut.onApplicationEvent(event)

        verify { stompAnnouncementEmitter.emit(announcement) }
    }
})
