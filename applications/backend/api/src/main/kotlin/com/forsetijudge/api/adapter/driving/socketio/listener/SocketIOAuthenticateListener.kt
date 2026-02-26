package com.forsetijudge.api.adapter.driving.socketio.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class SocketIOAuthenticateListener(
    private val findSessionByIdUseCase: FindSessionByIdUseCase,
) : DataListener<String> {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * @param client the SocketIOClient that has connected
     */
    override fun onData(
        client: SocketIOClient,
        data: String?,
        ackSender: AckRequest,
    ) {
        ExecutionContext.start(
            ip = client.handshakeData.httpHeaders.get("X-Forwarded-For"),
        )

        try {
            val cookieHeader = client.handshakeData?.httpHeaders?.get("Cookie")
            val sessionId = getSessionIdFromCookies(cookieHeader)

            if (sessionId == null) {
                logger.info("No session_id cookie. Continuing as guest.")
                client.sendEvent("ready", "Connected as guest")
                return
            }
            if (sessionId.isBlank()) {
                logger.info("Blank session_id cookie. Continuing as guest.")
                client.sendEvent("ready", "Connected as guest")
                return
            }

            val sessionUuid =
                try {
                    UUID.fromString(sessionId)
                } catch (e: IllegalArgumentException) {
                    logger.error("Invalid session_id cookie format: $sessionId")
                    client.sendEvent("error", "Invalid session_id cookie format")
                    return client.disconnect()
                }

            val session =
                try {
                    findSessionByIdUseCase.execute(
                        FindSessionByIdUseCase.Command(sessionUuid),
                    )
                } catch (e: UnauthorizedException) {
                    logger.info("Could not load session: ${e.message}")
                    client.sendEvent("error", e.message)
                    return client.disconnect()
                }

            logger.info("Found session with id: $sessionId")
            client.set("session", session)
            client.sendEvent("ready")
        } catch (ex: Exception) {
            logger.error("Error during client connection: ${ex.message}", ex)
            client.sendEvent("error", "An error occurred during connection")
            client.disconnect()
        }
    }

    /**
     * Extracts the session_id value from the Cookie header string.
     *
     * @param cookieHeader the raw Cookie header string from the client's handshake data
     * @return the session_id value if found, or null if not present
     */
    private fun getSessionIdFromCookies(cookieHeader: String?): String? {
        if (cookieHeader == null) {
            return null
        }
        val cookies = cookieHeader.split(";").dropLastWhile { it.isEmpty() }
        for (cookie in cookies) {
            val pair = cookie.trim().split("=", limit = 2)
            if (pair.size == 2 && pair[0].equals("session_id", ignoreCase = true)) {
                return pair[1]
            }
        }
        return null
    }
}
