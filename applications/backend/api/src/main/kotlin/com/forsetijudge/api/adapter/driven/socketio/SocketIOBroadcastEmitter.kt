package com.forsetijudge.api.adapter.driven.socketio

import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.SocketIOServer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

@Component
class SocketIOBroadcastEmitter(
    @Lazy private val socketIOServer: SocketIOServer,
) {
    private val logger = SafeLogger(this::class)

    fun emit(event: BroadcastEvent) {
        logger.info("Broadcasting event $event")
        socketIOServer.getRoomOperations(event.room).sendEvent(event.name, event.data)
    }

    fun emitToClient(
        client: SocketIOClient,
        event: BroadcastEvent,
    ) {
        logger.info("Emitting event $event to client ${client.sessionId}")
        client.sendEvent(event.name, event.data)
    }
}
