package com.forsetijudge.core.api.websocket.fanout

import com.corundumstudio.socketio.BroadcastOperations
import com.corundumstudio.socketio.SocketIOServer
import org.junit.jupiter.api.Test
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.data.redis.connection.DefaultMessage
import tools.jackson.databind.ObjectMapper

class SocketIOFanoutRedisMessageListenerTest {
    private val server = mock<SocketIOServer>()
    private val objectMapper = mock<ObjectMapper>()
    private val listener = SocketIOFanoutRedisMessageListener(server, objectMapper)

    @Test
    fun `deserializes redis message and broadcasts it to its room`() {
        val rawMessage = """{"room":"/contests/1/dashboard/guest","eventName":"SUBMISSION_CREATED","data":{"id":"submission-1"}}"""
        val messageBytes = rawMessage.toByteArray()
        val payload = SocketIOFanoutMessage("/contests/1/dashboard/guest", "SUBMISSION_CREATED", mapOf("id" to "submission-1"))
        val roomOperations = mock<BroadcastOperations>()
        whenever(objectMapper.readValue(eq(messageBytes), eq(SocketIOFanoutMessage::class.java))).thenReturn(payload)
        whenever(server.getRoomOperations(payload.room)).thenReturn(roomOperations)
        val message = DefaultMessage("topic".toByteArray(), messageBytes)

        listener.onMessage(message, null)

        verify(objectMapper).readValue(messageBytes, SocketIOFanoutMessage::class.java)
        verify(server).getRoomOperations(payload.room)
        verify(roomOperations).sendEvent(payload.eventName, payload.data)
    }
}
