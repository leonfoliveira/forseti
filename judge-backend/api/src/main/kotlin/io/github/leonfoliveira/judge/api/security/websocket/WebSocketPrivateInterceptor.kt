package io.github.leonfoliveira.judge.api.security.websocket

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import org.slf4j.LoggerFactory
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.messaging.support.MessageHeaderAccessor
import org.springframework.stereotype.Component

@Component
class WebSocketPrivateInterceptor : ChannelInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    private val privateConfigurations =
        mapOf(
            Regex("/topic/contests/[0-9+]/submissions/full") to setOf(Member.Type.JUDGE),
        )

    override fun preSend(
        message: Message<*>,
        channel: MessageChannel,
    ): Message<*>? {
        logger.info("Started PrivateWebSocketInterceptor")
        val accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) ?: return message
        val destination = accessor.destination ?: return message

        val allowedMembers =
            privateConfigurations.entries.find {
                it.key.matches(destination)
            }?.value

        if (allowedMembers == null) {
            logger.info("No private configuration found for destination: $destination")
            return message
        }

        val auth = message.headers.get("simpUser") as? JwtAuthentication
        if (auth == null || !auth.isAuthenticated) {
            logger.info("Not authenticated")
            throw UnauthorizedException()
        }

        if (allowedMembers.isNotEmpty() && auth.principal?.member?.type !in allowedMembers) {
            logger.info("User type not allowed: ${auth.principal?.member?.type}")
            throw ForbiddenException()
        }

        return message
    }
}
