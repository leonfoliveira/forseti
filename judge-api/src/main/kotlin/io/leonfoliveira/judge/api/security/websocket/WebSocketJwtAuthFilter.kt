package io.leonfoliveira.judge.api.security.websocket

import io.leonfoliveira.judge.api.util.AuthorizationExtractor
import org.slf4j.LoggerFactory
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.messaging.support.MessageHeaderAccessor
import org.springframework.stereotype.Component

@Component
class WebSocketJwtAuthFilter(
    private val authorizationExtractor: AuthorizationExtractor,
) : ChannelInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun preSend(
        message: Message<*>,
        channel: MessageChannel,
    ): Message<*>? {
        logger.info("Started JWT auth interceptor")
        val accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) ?: return message

        val authHeader = accessor.getNativeHeader("Authorization")?.first()
        authorizationExtractor.extractMember(authHeader)
        return message
    }
}
