package io.github.leonfoliveira.judge.api.security.websocket

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.api.util.AuthorizationContextUtil
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
import java.util.UUID

@Component
class WebSocketPrivateInterceptor : ChannelInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    private val privateFilters: Map<Regex, (String) -> Boolean> =
        mapOf(
            Regex("/topic/contests/[a-fA-F0-9-+]/submissions/full") to { destination: String ->
                val member = AuthorizationContextUtil.getMember()
                setOf(Member.Type.JUDGE, Member.Type.ADMIN).contains(member.type)
            },
            Regex("/topic/members/[a-fA-F0-9-+]/submissions/full") to { destination: String ->
                val member = AuthorizationContextUtil.getMember()
                val destinationMemberId = UUID.fromString(destination.split("/")[2])
                destinationMemberId == member.id
            },
        )

    override fun preSend(
        message: Message<*>,
        channel: MessageChannel,
    ): Message<*>? {
        logger.info("Started PrivateWebSocketInterceptor")
        val accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) ?: return message
        val destination = accessor.destination ?: return message

        val privateFilter =
            privateFilters.entries.find {
                it.key.matches(destination)
            }?.value

        if (privateFilter == null) {
            logger.info("No private configuration found for destination: $destination")
            return message
        }

        val auth = message.headers.get("simpUser") as? JwtAuthentication
        if (auth == null || !auth.isAuthenticated) {
            logger.info("Not authenticated")
            throw UnauthorizedException()
        }

        if (!privateFilter(destination)) {
            logger.info("User is not allow to access destination")
            throw ForbiddenException()
        }

        return message
    }
}
