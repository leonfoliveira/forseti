package com.forsetijudge.core.api.websocket

import com.corundumstudio.socketio.SocketConfig
import com.corundumstudio.socketio.SocketIOServer
import com.forsetijudge.core.api.websocket.listener.SocketIOJoinListener
import com.forsetijudge.core.api.websocket.listener.SocketIOSyncListener
import jakarta.annotation.PreDestroy
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
    private val socketIOSyncListener: SocketIOSyncListener,
) {
    private lateinit var server: SocketIOServer

    @Bean
    fun socketIOServer(): SocketIOServer {
        val config = com.corundumstudio.socketio.Configuration()

        config.port = port
        config.origin = allowedOrigins
        config.socketConfig =
            SocketConfig().apply {
                isReuseAddress = true
            }

        server = SocketIOServer(config)

        server.addEventListener("join", String::class.java, socketIOJoinListener)
        server.addEventListener("sync", String::class.java, socketIOSyncListener)
        server.start()

        return server
    }

    @PreDestroy
    fun stopSocketIOServer() {
        if (::server.isInitialized) {
            server.stop()
        }
    }
}
