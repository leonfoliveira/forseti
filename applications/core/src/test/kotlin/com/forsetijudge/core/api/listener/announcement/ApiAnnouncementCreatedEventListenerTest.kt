package com.forsetijudge.core.api.listener.announcement

import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageProducer
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.response.announcement.AnnouncementResponseDTO
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
    private val producer = mock<SSEFanoutRedisMessageProducer>()
    private val listener = ApiAnnouncementCreatedEventListener(announcementRepository, producer)

    @Test
    fun `fans out announcement created event to all dashboard rooms`() {
        val contest = MockEntityFactory.contest()
        val announcement = MockEntityFactory.announcement(contest = contest)
        whenever(announcementRepository.findByIdNullable(announcement.id)).thenReturn(announcement)

        listener.handle(AnnouncementEvent.Created(announcement.id))

        val messages = argumentCaptor<SSEFanoutMessage>()
        verify(producer, times(5)).produce(messages.capture())
        assertEquals(
            listOf(
                "admin-dashboard-${contest.id}",
                "judge-dashboard-${contest.id}",
                "staff-dashboard-${contest.id}",
                "contestant-dashboard-${contest.id}",
                "spectator-dashboard-${contest.id}",
            ),
            messages.allValues.map(SSEFanoutMessage::room),
        )
        assertEquals(List(5) { "ANNOUNCEMENT_CREATED" }, messages.allValues.map(SSEFanoutMessage::eventName))
        assertTrue(messages.allValues[0].data is AnnouncementResponseDTO)
        assertTrue(messages.allValues[1].data is AnnouncementResponseDTO)
        assertTrue(messages.allValues[2].data is AnnouncementResponseDTO)
        assertTrue(messages.allValues[3].data is AnnouncementResponseDTO)
        assertTrue(messages.allValues[4].data is AnnouncementResponseDTO)
    }

    @Test
    fun `throws NotFoundException when announcement does not exist`() {
        val announcementId = IdGenerator.getUUID()
        whenever(announcementRepository.findByIdNullable(announcementId)).thenReturn(null)

        val exception =
            assertThrows(NotFoundException::class.java) {
                listener.handle(AnnouncementEvent.Created(announcementId))
            }

        assertEquals("Could not find announcement with id: $announcementId", exception.message)
        verify(producer, never()).produce(any())
    }
}
