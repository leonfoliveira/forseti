package com.forsetijudge.api.adapter.config

import com.corundumstudio.socketio.SocketIOServer
import com.forsetijudge.api.adapter.driving.socketio.listener.SocketIOAuthenticateListener
import com.forsetijudge.api.adapter.driving.socketio.listener.SocketIOJoinListener
import com.forsetijudge.api.adapter.driving.socketio.listener.SocketIOPingListener
import com.forsetijudge.api.adapter.driving.socketio.listener.SocketIOSyncListener
import com.forsetijudge.api.adapter.driving.socketio.listener.SocketIOSyncListenerPayload
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@Suppress("unused")
class SocketIOConfig(
    @Value("\${server.cors.allowed-origins}")
    private val allowedOrigins: String,
    @Value("\${server.ws-port}")
    private val port: Int,
    private val socketIOAuthenticateListener: SocketIOAuthenticateListener,
    private val socketIOJoinListener: SocketIOJoinListener,
    private val socketIOPingListener: SocketIOPingListener,
    private val socketIOSyncListener: SocketIOSyncListener,
) {
    @Bean
    fun socketIOServer(): SocketIOServer {
        val config = com.corundumstudio.socketio.Configuration()

        config.port = port
        config.origin = allowedOrigins

        val server = SocketIOServer(config)

        server.addEventListener("ping", String::class.java, socketIOPingListener)
        server.addEventListener("authenticate", String::class.java, socketIOAuthenticateListener)
        server.addEventListener("join", String::class.java, socketIOJoinListener)
        server.addEventListener("sync", SocketIOSyncListenerPayload::class.java, socketIOSyncListener)

        return server
    }
}
