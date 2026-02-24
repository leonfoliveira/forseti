package com.forsetijudge.api.adapter.driving.middleware.websocket

import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import org.slf4j.LoggerFactory
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompCommand
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.messaging.support.MessageHeaderAccessor
import org.springframework.stereotype.Component

@Component
class WebSocketPrivateInterceptor(
    val webSocketTopicConfigs: WebSocketTopicConfigs,
) : ChannelInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Checks if the incoming WebSocket message has access to the destination based on the private topic configurations.
     */
    override fun preSend(
        message: Message<*>,
        channel: MessageChannel,
    ): Message<*>? {
        val accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) ?: return message

        // Only intercept SUBSCRIBE commands, other commands are not relevant for access control
        if (accessor.command != StompCommand.SUBSCRIBE) {
            return message
        }

        val destination = accessor.destination?.trim() ?: return message
        logger.info("Started PrivateWebSocketInterceptor for destination: $destination")

        val privateFilter =
            webSocketTopicConfigs.privateFilters.entries
                .find {
                    it.key.matches(destination)
                }

        if (privateFilter == null) {
            throw NotFoundException("Destination does not exist: $destination")
        }

        logger.info("Applying private filter: ${privateFilter.key}")
        try {
            privateFilter.value(destination)
        } catch (ex: Exception) {
            logger.warn("Access denied to destination: ${ex.message}")
            throw ex
        }

        logger.info("User is allowed to access destination")
        return message
    }
}
