package io.leonfoliveira.judge.api.security.websocket

import io.leonfoliveira.judge.api.security.JwtAuthentication
import io.leonfoliveira.judge.api.util.AuthorizationExtractor
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.UnauthorizedException
import org.slf4j.LoggerFactory
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.messaging.support.MessageHeaderAccessor
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class WebSocketPrivateInterceptor(
    private val authorizationExtractor: AuthorizationExtractor,
) : ChannelInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    private val privateConfigurations =
        mapOf(
            Regex("/topic/contests/[0-9+]/submissions/judge") to setOf(Member.Type.JUDGE),
            Regex("/topic/contests/[0-9+]/submissions/fail") to setOf(Member.Type.JUDGE),
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

        val auth = SecurityContextHolder.getContext().authentication as? JwtAuthentication
        if (auth == null || !auth.isAuthenticated || auth.principal == null) {
            logger.info("Not authenticated")
            throw UnauthorizedException()
        }

        if (allowedMembers.isNotEmpty() && auth.principal?.type !in allowedMembers) {
            logger.info("User type not allowed: ${auth.principal?.type}")
            throw ForbiddenException()
        }

        return message
    }
}
