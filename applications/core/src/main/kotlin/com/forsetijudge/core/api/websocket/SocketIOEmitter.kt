package com.forsetijudge.core.api.websocket

import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.SocketIOServer
import com.forsetijudge.core.util.SafeLogger
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

@Component
class SocketIOEmitter(
    @Lazy private val socketIOServer: SocketIOServer,
) {
    private val logger = SafeLogger(this::class)

    fun emit(
        room: String,
        event: String,
        data: String,
    ) {
        logger.info("Emitting event $event")
        socketIOServer.getRoomOperations(room).sendEvent(event, data)
    }

    fun emitToClient(
        client: SocketIOClient,
        event: String,
        data: String,
    ) {
        logger.info("Emitting event $event to client ${client.sessionId}")
        client.sendEvent(event, data)
    }
}
