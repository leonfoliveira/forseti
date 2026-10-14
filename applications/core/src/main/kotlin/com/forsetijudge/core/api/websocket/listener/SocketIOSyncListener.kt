package com.forsetijudge.core.api.websocket.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.forsetijudge.core.infrastructure.redis.SocketIORedisCacheStore
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import java.time.OffsetDateTime

@Component
class SocketIOSyncListener(
    private val socketIORedisCacheStore: SocketIORedisCacheStore,
) : DataListener<SocketIOSyncListenerPayload> {
    private val logger = SafeLogger(this::class)

    override fun onData(
        client: SocketIOClient,
        payload: SocketIOSyncListenerPayload,
        ackSender: AckRequest,
    ) {
        logger.info("Received sync request from client ${client.sessionId} for room ${payload.room} since ${payload.timestamp}")

        if (!client.allRooms.contains(payload.room)) {
            logger.warn("Client is not in room")
            return client.sendEvent("error", "Not in the room")
        }

        val events = socketIORedisCacheStore.getAllMessagesByRoomAfterTimestamp(payload.room, payload.timestamp)
        events.forEach {
            client.sendEvent(it.eventName, it.data)
        }
        client.sendEvent("sync_complete")
        logger.info("Completed sync request")
    }
}

data class SocketIOSyncListenerPayload(
    val room: String,
    val timestamp: OffsetDateTime,
)
