package com.forsetijudge.api.adapter.driving.middleware.websocket

import com.forsetijudge.core.domain.model.ExecutionContext
import org.slf4j.LoggerFactory
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.messaging.support.MessageHeaderAccessor
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class WebSocketExecutionContextInterceptor : ChannelInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Fill the ExecutionContext with relevant information from the handshake context and the WebSocket message headers.
     *
     * @param message The WebSocket message.
     * @param channel The message channel.
     * @return The message to continue processing, or null to abort.
     */
    override fun preSend(
        message: Message<*>,
        channel: MessageChannel,
    ): Message<*>? {
        ExecutionContext.start()

        logger.info("Extracting session and contestId from WebSocket message headers")

        val accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) ?: return message
        val handShakeContext = accessor.sessionAttributes?.get("handshake_context") as? ExecutionContext ?: return message
        val destination = accessor.destination ?: return message
        val contestIdFromDestination =
            try {
                UUID.fromString(destination.split("/")[3])
            } catch (_: Exception) {
                null
            }

        ExecutionContext.get().ip = handShakeContext.ip
        ExecutionContext.get().contestId = contestIdFromDestination

        return message
    }
}
