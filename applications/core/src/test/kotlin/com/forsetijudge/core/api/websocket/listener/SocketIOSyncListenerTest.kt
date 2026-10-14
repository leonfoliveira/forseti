package com.forsetijudge.core.api.websocket.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutMessage
import com.forsetijudge.core.infrastructure.redis.SocketIORedisCacheStore
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.OffsetDateTime

class SocketIOSyncListenerTest {
    private val cacheStore = mock<SocketIORedisCacheStore>()
    private val listener = SocketIOSyncListener(cacheStore)
    private val client = mock<SocketIOClient>()
    private val ackRequest = mock<AckRequest>()

    @Test
    fun `replays cached messages and marks synchronization complete`() {
        val room = "/contests/contest/dashboard/guest"
        val timestamp = OffsetDateTime.parse("2026-10-03T12:00:00Z")
        val payload = SocketIOSyncListenerPayload(room, timestamp)
        val first = SocketIOFanoutMessage(room, "created", mapOf("id" to 1))
        val second = SocketIOFanoutMessage(room, "updated", mapOf("id" to 2))
        whenever(client.allRooms).thenReturn(setOf(room))
        whenever(cacheStore.getAllMessagesByRoomAfterTimestamp(room, timestamp)).thenReturn(listOf(first, second))

        listener.onData(client, payload, ackRequest)

        verify(cacheStore).getAllMessagesByRoomAfterTimestamp(room, timestamp)
        verify(client).sendEvent(first.eventName, first.data)
        verify(client).sendEvent(second.eventName, second.data)
        verify(client).sendEvent("sync_complete")
        verify(client, never()).sendEvent(eq("error"), any())
    }

    @Test
    fun `rejects synchronization for a room the client has not joined`() {
        val room = "/contests/contest/dashboard/guest"
        val timestamp = OffsetDateTime.parse("2026-10-03T12:00:00Z")
        val payload = SocketIOSyncListenerPayload(room, timestamp)
        whenever(client.allRooms).thenReturn(emptySet())

        listener.onData(client, payload, ackRequest)

        verify(client).sendEvent("error", "Not in the room")
        verify(cacheStore, never()).getAllMessagesByRoomAfterTimestamp(any(), any())
        verify(client, never()).sendEvent("sync_complete")
    }

    @Test
    fun `completes synchronization when no cached messages exist`() {
        val room = "/contests/contest/dashboard/guest"
        val timestamp = OffsetDateTime.parse("2026-10-03T12:00:00Z")
        val payload = SocketIOSyncListenerPayload(room, timestamp)
        whenever(client.allRooms).thenReturn(setOf(room))
        whenever(cacheStore.getAllMessagesByRoomAfterTimestamp(eq(room), eq(timestamp))).thenReturn(emptyList())

        listener.onData(client, payload, ackRequest)

        verify(client).sendEvent("sync_complete")
        verify(client, never()).sendEvent(eq("error"), any())
    }
}
