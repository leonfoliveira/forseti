package com.forsetijudge.core.api.listener.announcement

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutMessage
import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutRedisMessageProducer
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.response.announcement.AnnouncementResponseBodyDTO
import com.forsetijudge.core.port.output.repository.AnnouncementRepository
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class ApiAnnouncementCreatedEventListenerTest {
    private val announcementRepository = mock<AnnouncementRepository>()
    private val producer = mock<SocketIOFanoutRedisMessageProducer>()
    private val listener = ApiAnnouncementCreatedEventListener(announcementRepository, producer)

    @Test
    fun `fans out announcement created event to all dashboard rooms`() {
        val contest = MockEntityFactory.contest()
        val announcement = MockEntityFactory.announcement(contest = contest)
        whenever(announcementRepository.findById(announcement.id)).thenReturn(announcement)

        listener.handle(AnnouncementEvent.Created(announcement.id))

        val messages = argumentCaptor<SocketIOFanoutMessage>()
        verify(producer, times(4)).produce(messages.capture())
        assertEquals(
            listOf(
                "/contests/${contest.id}/dashboard/admin",
                "/contests/${contest.id}/dashboard/contestant",
                "/contests/${contest.id}/dashboard/guest",
                "/contests/${contest.id}/dashboard/judge",
            ),
            messages.allValues.map(SocketIOFanoutMessage::room),
        )
        assertEquals(List(4) { "ANNOUNCEMENT_CREATED" }, messages.allValues.map(SocketIOFanoutMessage::eventName))
        assertTrue(messages.allValues[0].data is AnnouncementResponseBodyDTO)
        assertTrue(messages.allValues[1].data is AnnouncementResponseBodyDTO)
        assertTrue(messages.allValues[2].data is AnnouncementResponseBodyDTO)
        assertTrue(messages.allValues[3].data is AnnouncementResponseBodyDTO)
    }

    @Test
    fun `throws NotFoundException when announcement does not exist`() {
        val announcementId = IdGenerator.getUUID()
        whenever(announcementRepository.findById(announcementId)).thenReturn(null)

        val exception =
            assertThrows(NotFoundException::class.java) {
                listener.handle(AnnouncementEvent.Created(announcementId))
            }

        assertEquals("Could not find announcement with id: $announcementId", exception.message)
        verify(producer, never()).produce(any())
    }
}
