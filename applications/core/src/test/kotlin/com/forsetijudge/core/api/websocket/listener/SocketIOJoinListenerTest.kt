package com.forsetijudge.core.api.websocket.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.forsetijudge.core.api.websocket.middleware.SocketIORoomAuthorizationFilter
import com.forsetijudge.core.domain.exception.ForbiddenException
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class SocketIOJoinListenerTest {
    private val authorizationFilter = mock<SocketIORoomAuthorizationFilter>()
    private val listener = SocketIOJoinListener(authorizationFilter)
    private val client = mock<SocketIOClient>()
    private val ackRequest = mock<AckRequest>()

    @Test
    fun `joins room and acknowledges an authorized client`() {
        val room = "/contests/example/dashboard/guest"
        whenever(client.sessionId).thenReturn(java.util.UUID.randomUUID())

        listener.onData(client, room, ackRequest)

        verify(authorizationFilter).authorize(client, room)
        verify(client).joinRoom(room)
        verify(client).sendEvent("joined", room)
        verify(client, never()).sendEvent(eq("joinError"), any())
    }

    @Test
    fun `sends business exception message without joining denied room`() {
        val room = "/contests/private"
        whenever(client.sessionId).thenReturn(java.util.UUID.randomUUID())
        whenever(authorizationFilter.authorize(client, room)).thenThrow(ForbiddenException("Not allowed"))

        listener.onData(client, room, ackRequest)

        verify(client).sendEvent("joinError", "Not allowed")
        verify(client, never()).joinRoom(room)
        verify(client, never()).sendEvent("joined", room)
    }

    @Test
    fun `returns generic error when authorization fails unexpectedly`() {
        val room = "/contests/private"
        whenever(client.sessionId).thenReturn(java.util.UUID.randomUUID())
        whenever(authorizationFilter.authorize(client, room)).thenThrow(IllegalStateException("internal detail"))

        listener.onData(client, room, ackRequest)

        verify(client).sendEvent("joinError", "Could not join room")
        verify(client, never()).joinRoom(room)
    }
}
