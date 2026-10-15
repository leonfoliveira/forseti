package com.forsetijudge.core.api.http.sse.fanout

import com.forsetijudge.core.api.http.sse.SSEHelper
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.data.redis.connection.DefaultMessage
import tools.jackson.databind.ObjectMapper

class SSEFanoutRedisMessageListenerTest {
    private val objectMapper = mock<ObjectMapper>()
    private val listener = SSEFanoutRedisMessageListener(objectMapper)

    @Test
    fun `test onMessage`() {
        val rawMessage =
            """{"room":"guest-dashboard-123","eventName":"SUBMISSION_CREATED","data":{"id":"submission-1"}}"""
        val messageBytes = rawMessage.toByteArray()
        val payload = SSEFanoutMessage("guest-dashboard-123", "SUBMISSION_CREATED", mapOf("id" to "submission-1"))
        val message = DefaultMessage("topic".toByteArray(), messageBytes)

        mockStatic(SSEHelper::class.java).use { mockedStatic ->
            whenever(objectMapper.readValue(eq(messageBytes), eq(SSEFanoutMessage::class.java))).thenReturn(payload)

            listener.onMessage(message, null)

            verify(objectMapper).readValue(messageBytes, SSEFanoutMessage::class.java)
            mockedStatic.verify { SSEHelper.emit(payload) }
        }
    }
}
