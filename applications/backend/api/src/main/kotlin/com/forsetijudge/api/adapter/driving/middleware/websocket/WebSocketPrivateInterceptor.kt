package com.forsetijudge.api.adapter.driving.middleware.websocket

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.model.RequestContext
import org.slf4j.LoggerFactory
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
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
        val destination = accessor.destination ?: return message
        logger.info("Started PrivateWebSocketInterceptor for destination: $destination")
        val session = RequestContext.getContext().session

        // ROOT users bypass all checks
        if (session?.member?.type == Member.Type.ROOT) {
            logger.info("User is ROOT, bypassing access")
            return message
        }

        val privateFilter =
            webSocketTopicConfigs.privateFilters.entries
                .find {
                    it.key.matches(destination)
                }?.value

        // If no private configuration is present, the topic is public
        if (privateFilter == null) {
            logger.info("No private configuration found for destination: $destination")
            return message
        }

        privateFilter(destination)

        logger.info("User is allowed to access destination")
        return message
    }
}
