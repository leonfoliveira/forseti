package com.forsetijudge.api.adapter.driving.socketio

import com.corundumstudio.socketio.SocketIOServer
import org.slf4j.LoggerFactory
import org.springframework.context.SmartLifecycle
import org.springframework.stereotype.Component

@Component
@Suppress("unused")
class SocketIOServerManagedLifecycle(
    private val server: SocketIOServer,
) : SmartLifecycle {
    private val logger = LoggerFactory.getLogger(this::class.java)
    private var isRunning = false

    /**
     * Starts the Socket.IO server when the application context is refreshed.
     * This method is called by Spring during the startup phase.
     */
    override fun start() {
        logger.info("Starting Netty-SocketIO server")
        try {
            server.start()
            isRunning = true
            logger.info("Netty-SocketIO server started on port ${server.configuration.port} (ws)")
        } catch (e: Exception) {
            logger.error("Failed to start Socket.IO server", e)
        }
    }

    /**
     * Stops the Socket.IO server when the application context is closed.
     * This method is called by Spring during the shutdown phase.
     */
    override fun stop() {
        logger.info("Stopping Netty-SocketIO server")
        server.stop()
        isRunning = false
        logger.info("Netty-SocketIO server stopped")
    }

    override fun isRunning(): Boolean = isRunning

    override fun getPhase(): Int = Integer.MAX_VALUE
}
