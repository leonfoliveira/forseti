package com.forsetijudge.core.api.websocket.fanout

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Test

class SocketIOFanoutMessageTest {
    @Test
    fun `stores room event name and data`() {
        val data = mapOf("submissionId" to "id")

        val message = SocketIOFanoutMessage("/room", "SUBMISSION_UPDATED", data)

        assertEquals("/room", message.room)
        assertEquals("SUBMISSION_UPDATED", message.eventName)
        assertSame(data, message.data)
    }
}
