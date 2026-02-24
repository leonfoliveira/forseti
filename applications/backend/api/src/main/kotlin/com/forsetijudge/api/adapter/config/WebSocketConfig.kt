package com.forsetijudge.api.adapter.config

import com.forsetijudge.api.adapter.driving.middleware.websocket.WebSocketAuthenticationInterceptor
import com.forsetijudge.api.adapter.driving.middleware.websocket.WebSocketExecutionContextInterceptor
import com.forsetijudge.api.adapter.driving.middleware.websocket.WebSocketHandshakeExecutionContextInterceptor
import com.forsetijudge.api.adapter.driving.middleware.websocket.WebSocketPrivateInterceptor
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.config.ChannelRegistration
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
@EnableWebSocketMessageBroker
@Suppress("unused")
class WebSocketConfig(
    @Value("\${server.cors.allowed-origins}")
    private val allowedOrigins: String,
    private val webSocketHandshakeExecutionContextInterceptor: WebSocketHandshakeExecutionContextInterceptor,
    private val webSocketExecutionContextInterceptor: WebSocketExecutionContextInterceptor,
    private val webSocketAuthenticationInterceptor: WebSocketAuthenticationInterceptor,
    private val webSocketPrivateInterceptor: WebSocketPrivateInterceptor,
) : WebSocketMessageBrokerConfigurer {
    /**
     * Configure message broker with application destination prefixes and simple broker.
     *
     * @param registry the message broker registry to configure
     */
    override fun configureMessageBroker(registry: MessageBrokerRegistry) {
        registry.enableSimpleBroker("/topic")
        registry.setApplicationDestinationPrefixes("/app")
    }

    /**
     * Register STOMP endpoints with SockJS and CORS configuration.
     * It also adds a handshake interceptor to extract context information during the handshake process.
     *
     * @param registry the STOMP endpoint registry to configure
     */
    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        registry
            .addEndpoint("/ws")
            .addInterceptors(
                // Interceptor to store handshake context (ip, traceId, contestId) in the WebSocket session attributes
                webSocketHandshakeExecutionContextInterceptor,
            ).setAllowedOrigins(allowedOrigins)
    }

    /**
     * Configure client inbound channel with interceptors for context extraction and private subscription handling.
     *
     * @param registration the channel registration to configure
     */
    override fun configureClientInboundChannel(registration: ChannelRegistration) {
        registration.interceptors(
            // Interceptor to extract execution context (ip, traceId, contestId) from WebSocket message headers and handshake context
            webSocketExecutionContextInterceptor,
            // Interceptor to load session from handshake context and set in the execution context
            webSocketAuthenticationInterceptor,
            // Interceptor to enforce topic private configs
            webSocketPrivateInterceptor,
        )
    }
}
