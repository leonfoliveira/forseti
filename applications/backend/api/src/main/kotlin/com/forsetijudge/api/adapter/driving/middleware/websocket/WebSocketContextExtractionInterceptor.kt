package com.forsetijudge.api.adapter.driving.middleware.websocket

import com.forsetijudge.core.application.util.IdUtil
import com.forsetijudge.core.domain.model.RequestContext
import io.opentelemetry.api.trace.Span
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.messaging.support.MessageHeaderAccessor
import org.springframework.stereotype.Component

@Component
class WebSocketContextExtractionInterceptor : ChannelInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Fill the RequestContext from the WebSocket session attributes.
     */
    override fun preSend(
        message: Message<*>,
        channel: MessageChannel,
    ): Message<*>? {
        val traceId = IdUtil.getTraceId()
        val currentSpan = Span.current()
        currentSpan.setAttribute("trace_id", traceId)
        MDC.put("trace_id", traceId)

        logger.info("Started WebSocketAuthExtractionInterceptor")

        val accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java)
        val context =
            accessor?.sessionAttributes?.get("context") as? RequestContext
                ?: RequestContext()

        context.traceId = traceId
        RequestContext.setContext(context)

        logger.info("Extracted context from WebSocket attributes: $context")

        return message
    }
}
