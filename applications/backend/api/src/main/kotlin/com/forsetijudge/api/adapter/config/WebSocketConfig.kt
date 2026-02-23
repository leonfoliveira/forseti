package com.forsetijudge.api.adapter.config

import com.forsetijudge.api.adapter.driving.middleware.websocket.WebSocketContextHandshakeInterceptor
import com.forsetijudge.api.adapter.driving.middleware.websocket.WebSocketExecutionContextInterceptor
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
class WebSocketConfig(
    @Value("\${server.cors.allowed-origins}")
    val allowedOrigins: String,
    val webSocketContextHandshakeInterceptor: WebSocketContextHandshakeInterceptor,
    val webSocketExecutionContextInterceptor: WebSocketExecutionContextInterceptor,
    val webSocketPrivateInterceptor: WebSocketPrivateInterceptor,
) : WebSocketMessageBrokerConfigurer {
    /**
     * Configure message broker with application destination prefixes and simple broker.
     */
    override fun configureMessageBroker(registry: MessageBrokerRegistry) {
        registry.enableSimpleBroker("/topic")
        registry.setApplicationDestinationPrefixes("/app")
    }

    /**
     * Register STOMP endpoints with SockJS and CORS configuration.
     * It also adds a handshake interceptor to extract context information during the handshake process.
     */
    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        registry
            .addEndpoint("/ws")
            .addInterceptors(webSocketContextHandshakeInterceptor)
            .setAllowedOrigins(allowedOrigins)
            .withSockJS()
    }

    /**
     * Configure client inbound channel with interceptors for context extraction and private subscription handling.
     */
    override fun configureClientInboundChannel(registration: ChannelRegistration) {
        registration.interceptors(webSocketExecutionContextInterceptor, webSocketPrivateInterceptor)
    }
}
