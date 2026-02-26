package com.forsetijudge.infrastructure.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import org.springframework.context.annotation.Bean
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer
import org.springframework.data.redis.serializer.StringRedisSerializer
import org.springframework.stereotype.Component

@Component
class RedisConfig(
    private val objectMapper: ObjectMapper,
) {
    @Bean
    fun redisTemplate(factory: RedisConnectionFactory): RedisTemplate<String, BroadcastEvent> {
        val template = RedisTemplate<String, BroadcastEvent>()
        template.connectionFactory = factory

        val serializer = Jackson2JsonRedisSerializer(objectMapper, BroadcastEvent::class.java)
        template.keySerializer = StringRedisSerializer()
        template.valueSerializer = serializer

        return template
    }
}
