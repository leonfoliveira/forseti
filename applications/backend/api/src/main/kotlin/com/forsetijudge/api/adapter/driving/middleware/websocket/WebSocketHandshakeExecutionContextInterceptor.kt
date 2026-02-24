package com.forsetijudge.api.adapter.driving.middleware.websocket

import com.forsetijudge.core.domain.model.ExecutionContext
import org.slf4j.LoggerFactory
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.stereotype.Component
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.server.HandshakeInterceptor

@Component
class WebSocketHandshakeExecutionContextInterceptor : HandshakeInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Stores the current RequestContext in the WebSocket session attributes before the handshake.
     */
    override fun beforeHandshake(
        request: ServerHttpRequest,
        response: ServerHttpResponse,
        wsHandler: WebSocketHandler,
        attributes: MutableMap<String, Any>,
    ): Boolean {
        logger.info("Storing handshake context in WebSocket attributes")
        attributes["handshake_context"] = ExecutionContext.get()
        return true
    }

    override fun afterHandshake(
        request: ServerHttpRequest,
        response: ServerHttpResponse,
        wsHandler: WebSocketHandler,
        exception: Exception?,
    ) {}
}
