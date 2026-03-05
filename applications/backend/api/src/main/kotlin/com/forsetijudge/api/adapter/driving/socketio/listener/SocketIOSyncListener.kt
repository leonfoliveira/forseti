package com.forsetijudge.api.adapter.driving.socketio.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.api.adapter.driven.socketio.SocketIOBroadcastEmitter
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.infrastructure.adapter.driven.redis.BroadcastEventRedisStore
import org.springframework.stereotype.Component
import java.time.OffsetDateTime

@Component
class SocketIOSyncListener(
    private val broadcastEventRedisStore: BroadcastEventRedisStore,
    private val socketIOBroadcastEmitter: SocketIOBroadcastEmitter,
    private val objectMapper: ObjectMapper,
) : DataListener<String> {
    private val logger = SafeLogger(this::class)

    override fun onData(
        client: SocketIOClient,
        data: String,
        ackSender: AckRequest,
    ) {
        val payload =
            try {
                objectMapper.readValue(data, SocketIOSyncListenerPayload::class.java)
            } catch (_: Exception) {
                logger.warn("Failed to parse sync request payload")
                return client.sendEvent("error", "Invalid payload")
            }

        logger.info("Received sync request from client ${client.sessionId} for room ${payload.room} since ${payload.timestamp}")

        if (!client.allRooms.contains(payload.room)) {
            logger.warn("Client is not in room")
            return client.sendEvent("error", "Not in the room")
        }

        val events = broadcastEventRedisStore.getAllSince(payload.room, payload.timestamp)
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
