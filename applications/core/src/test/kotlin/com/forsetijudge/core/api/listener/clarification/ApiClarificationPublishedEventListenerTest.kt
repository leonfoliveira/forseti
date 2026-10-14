package com.forsetijudge.core.api.listener.clarification

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutMessage
import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutRedisMessageProducer
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.response.clarification.ClarificationResponseDTO
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class ApiClarificationPublishedEventListenerTest {
    private val clarificationRepository = mock<ClarificationRepository>()
    private val producer = mock<SocketIOFanoutRedisMessageProducer>()
    private val listener = ApiClarificationPublishedEventListener(clarificationRepository, producer)

    @Test
    fun `fans out clarification answered event to all dashboard rooms`() {
        val contest = MockEntityFactory.contest()
        val clarification = MockEntityFactory.clarification(contest = contest)
        whenever(clarificationRepository.findById(clarification.id)).thenReturn(clarification)

        listener.handle(ClarificationEvent.Published(clarification.id))

        val messages = argumentCaptor<SocketIOFanoutMessage>()
        verify(producer, times(4)).produce(messages.capture())
        assertEquals(
            listOf(
                "/contests/${contest.id}/dashboard/admin",
                "/contests/${contest.id}/dashboard/judge",
                "/contests/${contest.id}/dashboard/contestant",
                "/contests/${contest.id}/dashboard/guest",
            ),
            messages.allValues.map(SocketIOFanoutMessage::room),
        )
        assertEquals(List(4) { "CLARIFICATION_PUBLISHED" }, messages.allValues.map(SocketIOFanoutMessage::eventName))
        assertTrue(messages.allValues[0].data is ClarificationResponseDTO)
        assertTrue(messages.allValues[1].data is ClarificationResponseDTO)
        assertTrue(messages.allValues[2].data is ClarificationResponseDTO)
        assertTrue(messages.allValues[3].data is ClarificationResponseDTO)
    }

    @Test
    fun `throws NotFoundException when clarification does not exist`() {
        val clarificationId = MockEntityFactory.clarification().id
        whenever(clarificationRepository.findById(clarificationId)).thenReturn(null)

        val exception =
            assertThrows<NotFoundException> {
                listener.handle(ClarificationEvent.Published(clarificationId))
            }

        assertEquals("Could not find clarification with id: $clarificationId", exception.message)
    }
}
