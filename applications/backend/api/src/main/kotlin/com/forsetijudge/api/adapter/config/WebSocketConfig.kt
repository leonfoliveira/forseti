package com.forsetijudge.api.adapter.config

import com.corundumstudio.socketio.SocketIOServer
import com.forsetijudge.api.adapter.driving.socketio.listener.SocketIOConnectListener
import com.forsetijudge.api.adapter.driving.socketio.listener.SocketIOSubscribeListener
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@Suppress("unused")
class WebSocketConfig(
    @Value("\${server.cors.allowed-origins}")
    private val allowedOrigins: String,
    @Value("\${server.ws-port}")
    private val port: Int,
    private val socketIOConnectListener: SocketIOConnectListener,
    private val socketIOSubscribeListener: SocketIOSubscribeListener,
) {
    @Bean
    fun socketIOServer(): SocketIOServer {
        val config = com.corundumstudio.socketio.Configuration()

        config.port = port
        config.origin = allowedOrigins

        val server = SocketIOServer(config)

        server.addConnectListener(socketIOConnectListener)
        server.addEventListener("subscribe", String::class.java, socketIOSubscribeListener)

        return server
    }
}
