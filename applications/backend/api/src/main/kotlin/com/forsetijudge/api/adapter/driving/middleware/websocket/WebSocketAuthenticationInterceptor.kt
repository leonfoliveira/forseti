package com.forsetijudge.api.adapter.driving.middleware.websocket

import com.forsetijudge.core.domain.model.ExecutionContext
import org.slf4j.LoggerFactory
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.messaging.support.MessageHeaderAccessor
import org.springframework.stereotype.Component

@Component
class WebSocketAuthenticationInterceptor : ChannelInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Authenticate the user based on the session information extracted from the WebSocket message headers.
     * If the session is valid, populate the ExecutionContext with the session information.
     * If the session is invalid or missing, continue as guest (no authentication) but do not throw an error, as some WebSocket endpoints may allow guest access.
     *
     * @param message The WebSocket message.
     * @param channel The message channel.
     * @return The message to continue processing, or null to abort.
     */
    override fun preSend(
        message: Message<*>,
        channel: MessageChannel,
    ): Message<*>? {
        logger.info("Extracting session and contestId from WebSocket message headers")

        val accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) ?: return message
        val handShakeContext = accessor.sessionAttributes?.get("handshake_context") as? ExecutionContext ?: return message
        val session = handShakeContext.session

        if (session != null) {
            val contextContestId = ExecutionContext.getContestIdNullable()
            if (contextContestId != null && contextContestId != session.contest?.id) {
                logger.info("Session does not belong to the current contest. Continuing as guest.")
                return message
            }

            ExecutionContext.authenticate(session)
        }
        logger.info("Finished authenticating successfully")
        return message
    }
}
