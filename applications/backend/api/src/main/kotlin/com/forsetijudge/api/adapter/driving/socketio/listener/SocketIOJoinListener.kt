package com.forsetijudge.api.adapter.driving.socketio.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class SocketIOJoinListener(
    val socketIORoomAuthorizers: SocketIORoomAuthorizers,
) : DataListener<String> {
    private val logger = SafeLogger(this::class)

    /**
     * Handles client subscription to a room.
     * It checks if the room matches any of the private filters defined in [SocketIORoomAuthorizers] and applies the corresponding filter function to authorize the client.
     * If the client is authorized, it joins the client to the room. If not authorized, it sends an error message back to the client.
     */
    override fun onData(
        client: SocketIOClient,
        roomName: String,
        ackSender: AckRequest,
    ) {
        val contestId = extractContestId(roomName)
        ExecutionContext.start(
            ip = client.handshakeData.httpHeaders.get("X-Forwarded-For"),
            contestId = contestId,
        )

        val session = client.get<SessionResponseBodyDTO?>("session")
        if (session != null) {
            if (contestId != null) {
                val memberContestId = session.member.contestId
                if (memberContestId != null && memberContestId != ExecutionContext.getContestIdNullable()) {
                    logger.info("Session does not belong to the current contest. Continuing as guest.")
                } else {
                    ExecutionContext.setSession(session)
                }
            } else {
                ExecutionContext.setSession(session)
            }
        }

        logger.info("Client is trying to subscribe to room: $roomName")

        val authorizer =
            socketIORoomAuthorizers.authorizers.entries
                .find {
                    it.key.matches(roomName)
                }

        if (authorizer == null) {
            logger.warn("No private filter found for room: $roomName")
            return client.sendEvent("error", "Room not found: $roomName")
        }

        logger.info("Applying private filter: ${authorizer.key}")
        try {
            authorizer.value(roomName)
            client.joinRoom(roomName)
            logger.info("Client subscribed to room: $roomName")
            client.sendEvent("joined", roomName)
        } catch (ex: Exception) {
            logger.info("Could not authorize: ${ex.message}")
            client.sendEvent("error", "Unauthorized to subscribe to room: $roomName")
        }
    }

    /**
     * Extracts the contest ID from the room name using a regular expression.
     *
     * @param roomName The name of the room from which to extract the contest ID.
     * @return The extracted contest ID as a UUID, or null if the room name does not match the expected format or if the contest ID is not a valid UUID.
     */
    fun extractContestId(roomName: String): UUID? {
        val pattern = Regex("/contests/(?<contestId>[a-f0-9\\-]+).*")
        val matchResult = pattern.matchEntire(roomName)
        val value = matchResult?.groups?.get("contestId")?.value ?: return null
        return try {
            UUID.fromString(value)
        } catch (_: IllegalArgumentException) {
            null
        }
    }
}
