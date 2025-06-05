package io.leonfoliveira.judge.api.config

import io.leonfoliveira.judge.api.security.websocket.WebSocketJwtAuthFilter
import io.leonfoliveira.judge.api.security.websocket.WebSocketPrivateInterceptor
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
    val webSocketJwtAuthFilter: WebSocketJwtAuthFilter,
    val webSocketPrivateInterceptor: WebSocketPrivateInterceptor,
) : WebSocketMessageBrokerConfigurer {
    override fun configureMessageBroker(registry: MessageBrokerRegistry) {
        registry.enableSimpleBroker("/topic")
        registry.setApplicationDestinationPrefixes("/app")
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        registry.addEndpoint("/ws")
            .setAllowedOrigins(allowedOrigins)
            .withSockJS()
    }

    override fun configureClientInboundChannel(registration: ChannelRegistration) {
        registration.interceptors(webSocketJwtAuthFilter, webSocketPrivateInterceptor)
    }
}
