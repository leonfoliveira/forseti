package com.forsetijudge.core.api.websocket.fanout

import com.forsetijudge.core.infrastructure.redis.RedisPubSubConfig
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component
class SocketIOFanoutRedisMessageProducer(
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper,
) {
    fun produce(payload: SocketIOFanoutMessage) {
        val message = objectMapper.writeValueAsString(payload)
        redisTemplate.convertAndSend(RedisPubSubConfig.WEBSOCKET_FANOUT_TOPIC, message)
    }
}
