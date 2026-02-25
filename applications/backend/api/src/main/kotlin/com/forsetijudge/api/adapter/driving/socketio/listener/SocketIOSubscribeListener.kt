package com.forsetijudge.api.adapter.driving.socketio.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class SocketIOSubscribeListener(
    val socketIOTopicPrivateConfigs: SocketIOTopicPrivateConfigs,
) : DataListener<String> {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Handles client subscription to a topic.
     * It checks if the topic matches any of the private filters defined in [SocketIOTopicPrivateConfigs] and applies the corresponding filter function to authorize the client.
     * If the client is authorized, it joins the client to the topic room. If not authorized, it sends an error message back to the client.
     */
    override fun onData(
        client: SocketIOClient,
        topicName: String,
        ackSender: AckRequest,
    ) {
        logger.info("Client is trying to subscribe to topic: {}", topicName)

        ExecutionContext.get().contestId = BroadcastTopic.extractContestId(topicName)

        val privateFilter =
            socketIOTopicPrivateConfigs.privateFilters.entries
                .find {
                    it.key.matches(topicName)
                }

        if (privateFilter == null) {
            logger.warn("No private filter found for topic: {}", topicName)
            client.sendEvent("error", "Topic not found: $topicName")
            return
        }

        logger.info("Applying private filter: ${privateFilter.key}")
        try {
            privateFilter.value(topicName)
            client.joinRoom(topicName)
            logger.info("Client subscribed to topic: {}", topicName)
        } catch (ex: Exception) {
            logger.info("Could not authorize: ${ex.message}")
            client.sendEvent("error", "Unauthorized to subscribe to topic: $topicName")
        }
    }
}
