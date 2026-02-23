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
     * Fill the RequestContext from the WebSocket session attributes.
     */
    override fun preSend(
        message: Message<*>,
        channel: MessageChannel,
    ): Message<*>? {
        val accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java)
        val handshakeContext = accessor?.sessionAttributes?.get("context") as? ExecutionContext
        val destination = accessor?.destination ?: return message
        val contestId =
            try {
                UUID.fromString(destination.split("/")[3])
            } catch (e: Exception) {
                null
            }

        if (handshakeContext != null) {
            ExecutionContext.set(handshakeContext)
        } else {
            ExecutionContext.start()
        }
        ExecutionContext.get().contestId = contestId

        logger.info("Started WebSocketAuthExtractionInterceptor")

        return message
    }
}
