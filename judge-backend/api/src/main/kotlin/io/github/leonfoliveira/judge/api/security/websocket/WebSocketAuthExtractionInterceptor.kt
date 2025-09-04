package io.github.leonfoliveira.judge.api.security.websocket

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import org.slf4j.LoggerFactory
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import kotlin.text.get

@Component
class WebSocketAuthExtractionInterceptor(
    val contestAuthFilter: ContestAuthFilter,
) : ChannelInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun preSend(
        message: Message<*>,
        channel: MessageChannel,
    ): Message<*>? {
        logger.info("Started WebSocketAuthExtractionInterceptor")

        val jwtAuthentication = message.headers.get("simpUser") as? JwtAuthentication
        SecurityContextHolder.getContext().authentication = jwtAuthentication

        return message
    }
}
