package io.github.leonfoliveira.judge.api.middleware.websocket

import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.common.domain.model.RequestContext
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.messaging.support.MessageHeaderAccessor
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class WebSocketContextExtractionInterceptor(
    val contestAuthFilter: ContestAuthFilter,
) : ChannelInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun preSend(
        message: Message<*>,
        channel: MessageChannel,
    ): Message<*>? {
        logger.info("Started WebSocketAuthExtractionInterceptor")

        val accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java)
        val context =
            accessor?.sessionAttributes?.get("context") as? RequestContext
                ?: RequestContext()

        if (context.traceId == null) {
            context.traceId = UUID.randomUUID().toString()
        }
        MDC.put("traceId", context.traceId)
        RequestContext.setContext(context)

        logger.info("Extracted context from WebSocket attributes: $context")

        return message
    }
}
