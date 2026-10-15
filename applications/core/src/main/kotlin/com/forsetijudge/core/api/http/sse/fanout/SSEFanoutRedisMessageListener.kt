package com.forsetijudge.core.api.http.sse.fanout

import com.forsetijudge.core.api.http.sse.SSEHelper
import org.springframework.data.redis.connection.Message
import org.springframework.data.redis.connection.MessageListener
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component
class SSEFanoutRedisMessageListener(
    private val objectMapper: ObjectMapper,
) : MessageListener {
    override fun onMessage(
        message: Message,
        pattern: ByteArray?,
    ) {
        val parsedMessage = objectMapper.readValue(message.body, SSEFanoutMessage::class.java)
        SSEHelper.emit(parsedMessage)
    }
}
