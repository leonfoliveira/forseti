package com.forsetijudge.core.infrastructure.redis

import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageListener
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.listener.ChannelTopic
import org.springframework.data.redis.listener.RedisMessageListenerContainer
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter

@Configuration
class RedisPubSubConfig {
    @Bean
    fun redisContainer(
        connectionFactory: RedisConnectionFactory,
        sseFanoutRedisMessageListener: SSEFanoutRedisMessageListener,
    ): RedisMessageListenerContainer {
        val container = RedisMessageListenerContainer()
        container.setConnectionFactory(connectionFactory)

        container.addMessageListener(
            MessageListenerAdapter(sseFanoutRedisMessageListener),
            ChannelTopic(SSERedisCacheStore.FANOUT_TOPIC),
        )

        return container
    }
}
