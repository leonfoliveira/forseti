package com.forsetijudge.core.api.websocket.fanout

import com.corundumstudio.socketio.SocketIOServer
import org.springframework.context.annotation.Lazy
import org.springframework.data.redis.connection.Message
import org.springframework.data.redis.connection.MessageListener
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component
class SocketIOFanoutRedisMessageListener(
    @Lazy private val socketIOServer: SocketIOServer,
    private val objectMapper: ObjectMapper,
) : MessageListener {
    override fun onMessage(
        message: Message,
        pattern: ByteArray?,
    ) {
        val payload = objectMapper.readValue(message.body, SocketIOFanoutMessage::class.java)
        socketIOServer.getRoomOperations(payload.room).sendEvent(payload.eventName, payload.data)
    }
}
