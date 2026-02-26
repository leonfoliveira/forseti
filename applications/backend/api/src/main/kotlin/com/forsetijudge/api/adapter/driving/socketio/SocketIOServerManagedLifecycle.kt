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

    @Volatile
    private var isRunning = false

    /**
     * Starting the Socket.IO server in the start() method ensures it is fully initialized
     */
    override fun start() {
        if (isRunning) return

        logger.info("Starting Netty-SocketIO server...")
        try {
            server.start()
            isRunning = true
            logger.info("Netty-SocketIO server started on port ${server.configuration.port}")
        } catch (ex: Exception) {
            logger.error("Failed to start Socket.IO server. Application will now exit.", ex)
            throw ex
        }
    }

    /**
     * Gracefully stops the Socket.IO server, allowing it to finish processing ongoing connections and tasks before shutting down.
     */
    override fun stop(callback: Runnable) {
        if (isRunning) {
            logger.info("Stopping Netty-SocketIO server...")
            try {
                server.stop()
                isRunning = false
                logger.info("Netty-SocketIO server stopped successfully")
            } catch (ex: Exception) {
                logger.error("Error during Netty-SocketIO server shutdown", ex)
            } finally {
                callback.run()
            }
        } else {
            callback.run()
        }
    }

    override fun stop() {
        isRunning = false
    }

    override fun isRunning(): Boolean = isRunning

    /**
     * Set to a high value so it starts AFTER other beans (like databases) and stops BEFORE them during shutdown.
     */
    override fun getPhase(): Int = Integer.MAX_VALUE

    override fun isAutoStartup(): Boolean = true
}
