package com.forsetijudge.core.api.websocket.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.forsetijudge.core.api.websocket.middleware.SocketIORoomAuthorizationFilter
import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component

@Component
class SocketIOJoinListener(
    private val socketIORoomAuthorizationFilter: SocketIORoomAuthorizationFilter,
) : DataListener<String> {
    private val logger = SafeLogger(this::class)

    /**
     * Handles the event when a client joins a room.
     *
     * @param client The SocketIOClient that is joining the room.
     * @param roomName The name of the room to join.
     * @param ackSender The acknowledgment request to send back to the client.
     */
    override fun onData(
        client: SocketIOClient,
        roomName: String,
        ackSender: AckRequest,
    ) {
        try {
            socketIORoomAuthorizationFilter.authorize(client, roomName)
        } catch (exception: BusinessException) {
            logger.info("Client ${client.sessionId} was denied access to room $roomName: ${exception.message}")
            client.sendEvent("joinError", exception.message)
            return
        }

        logger.info("Client ${client.sessionId} joined room $roomName")

        client.joinRoom(roomName)
        client.sendEvent("joined", roomName)
    }
}
