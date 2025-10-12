package io.github.leonfoliveira.forseti.api.middleware.websocket

import io.github.leonfoliveira.forseti.common.domain.entity.Member
import io.github.leonfoliveira.forseti.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.domain.model.RequestContext
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

    override fun preSend(
        message: Message<*>,
        channel: MessageChannel,
    ): Message<*>? {
        val accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) ?: return message
        val destination = accessor.destination ?: return message
        logger.info("Started PrivateWebSocketInterceptor for destination: $destination")
        val session = RequestContext.getContext().session

        if (session?.member?.type == Member.Type.ROOT) {
            logger.info("User is ROOT, bypassing access")
            return message
        }

        val privateFilter =
            webSocketTopicConfigs.privateFilters.entries
                .find {
                    it.key.matches(destination)
                }?.value

        if (privateFilter == null) {
            logger.info("No private configuration found for destination: $destination")
            return message
        }

        if (!privateFilter(destination)) {
            logger.info("User is NOT allowed to access destination")
            throw ForbiddenException()
        }

        logger.info("User is allowed to access destination")
        return message
    }
}
