package live.forseti.api.adapter.driving.middleware.websocket

import live.forseti.core.domain.model.RequestContext
import org.slf4j.LoggerFactory
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.stereotype.Component
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.server.HandshakeInterceptor

@Component
class WebSocketContextHandshakeInterceptor : HandshakeInterceptor {
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
        val context = RequestContext.getContext()
        logger.info("Storing context in WebSocket attributes: $context")
        attributes["context"] = context
        return true
    }

    override fun afterHandshake(
        request: ServerHttpRequest,
        response: ServerHttpResponse,
        wsHandler: WebSocketHandler,
        exception: Exception?,
    ) {
        // No-op
    }
}
