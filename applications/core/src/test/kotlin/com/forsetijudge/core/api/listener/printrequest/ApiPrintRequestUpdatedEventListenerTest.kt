package com.forsetijudge.core.api.listener.printrequest

import com.forsetijudge.core.api.http.sse.SSE
import com.forsetijudge.core.api.http.sse.SSERoomBuilder
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageProducer
import com.forsetijudge.core.domain.event.PrintRequestEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.response.printrequest.toResponseDTO
import com.forsetijudge.core.port.output.repository.PrintRequestRepository
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.mock
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class ApiPrintRequestUpdatedEventListenerTest {
    private val printRequestRepository = mock<PrintRequestRepository>()
    private val sseFanoutRedisMessageProducer = org.mockito.kotlin.mock<SSEFanoutRedisMessageProducer>()
    private val listener = ApiPrintRequestUpdatedEventListener(printRequestRepository, sseFanoutRedisMessageProducer)

    @Test
    fun `should throw NotFoundException when print request does not exist`() {
        val event = PrintRequestEvent.Updated(printRequestId = IdGenerator.getUUID())
        whenever(printRequestRepository.findByIdNullable(event.printRequestId)).thenReturn(null)

        assertThrows<NotFoundException> {
            listener.handle(event)
        }
    }

    @Test
    fun `should produce SSEFanoutMessage for all dashboard rooms when print request is created`() {
        val printRequest = MockEntityFactory.printRequest()
        val event = PrintRequestEvent.Updated(printRequestId = printRequest.id)
        whenever(printRequestRepository.findByIdNullable(event.printRequestId)).thenReturn(printRequest)

        listener.handle(event)

        val produceCaptor = argumentCaptor<SSEFanoutMessage>()
        verify(sseFanoutRedisMessageProducer, times(3)).produce(produceCaptor.capture())
        val expected =
            listOf(
                SSERoomBuilder.buildAdminDashboardRoom(event.printRequestId),
                SSERoomBuilder.buildStaffDashboardRoom(event.printRequestId),
                SSERoomBuilder.buildMemberPrivateRoom(printRequest.submission.member.id),
            )
        produceCaptor.allValues.forEachIndexed { index, message ->
            assertEquals(expected[index], message.room)
            assertEquals(SSE.PRINT_REQUEST_UPDATED.name, message.eventName)
            assertEquals(printRequest.toResponseDTO(), message.data)
        }
    }
}
