package com.forsetijudge.api.adapter.driving.socketio.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.forsetijudge.api.adapter.driven.socketio.SocketIOBroadcastEmitter
import com.forsetijudge.infrastructure.adapter.driven.redis.BroadcastEventRedisStore
import org.springframework.stereotype.Component
import java.time.OffsetDateTime

@Component
class SocketIOSyncListener(
    private val broadcastEventRedisStore: BroadcastEventRedisStore,
    private val socketIOBroadcastEmitter: SocketIOBroadcastEmitter,
) : DataListener<SocketIOSyncListenerPayload> {
    private val logger = org.slf4j.LoggerFactory.getLogger(SocketIOSyncListener::class.java)

    override fun onData(
        client: SocketIOClient,
        data: SocketIOSyncListenerPayload,
        ackSender: AckRequest,
    ) {
        logger.info("Received sync request from client ${client.sessionId} for room ${data.room} since ${data.timestamp}")

        if (!client.allRooms.contains(data.room)) {
            logger.warn("Client is not in room")
            return client.sendEvent("error", "Not in the room")
        }

        client.sendEvent("sync_start")
        val events = broadcastEventRedisStore.getAllSince(data.room, data.timestamp)
        events.forEach {
            socketIOBroadcastEmitter.emitToClient(client, it)
        }
        client.sendEvent("sync_complete")
        logger.info("Completed sync request")
    }
}

data class SocketIOSyncListenerPayload(
    val room: String,
    val timestamp: OffsetDateTime,
)
