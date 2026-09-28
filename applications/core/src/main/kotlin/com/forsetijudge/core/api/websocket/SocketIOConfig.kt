package com.forsetijudge.core.api.websocket

import com.corundumstudio.socketio.SocketIOServer
import com.forsetijudge.core.api.websocket.listener.SocketIOJoinListener
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@Suppress("unused")
class SocketIOConfig(
    @Value($$"${server.cors.allowed-origins}")
    private val allowedOrigins: String,
    @Value($$"${server.ws-port}")
    private val port: Int,
    private val socketIOJoinListener: SocketIOJoinListener,
) {
    @Bean
    fun socketIOServer(): SocketIOServer {
        val config = com.corundumstudio.socketio.Configuration()

        config.port = port
        config.origin = allowedOrigins

        val server = SocketIOServer(config)

        server.addEventListener("join", String::class.java, socketIOJoinListener)

        return server
    }
}
