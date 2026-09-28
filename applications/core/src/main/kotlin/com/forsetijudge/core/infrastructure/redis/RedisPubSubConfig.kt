package com.forsetijudge.core.infrastructure.redis

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutRedisMessageListener
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.listener.ChannelTopic
import org.springframework.data.redis.listener.RedisMessageListenerContainer
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter

@Configuration
class RedisPubSubConfig {
    companion object {
        const val WEBSOCKET_FANOUT_TOPIC = "websocket_fanout_topic"
    }

    @Bean("websocket_fanout_topic")
    fun websocketFanoutTopic(): ChannelTopic = ChannelTopic(WEBSOCKET_FANOUT_TOPIC)

    @Bean
    fun redisContainer(
        connectionFactory: RedisConnectionFactory,
        socketIOFanoutRedisMessageListener: SocketIOFanoutRedisMessageListener,
        websocketFanoutTopic: ChannelTopic,
    ): RedisMessageListenerContainer {
        val container = RedisMessageListenerContainer()
        container.setConnectionFactory(connectionFactory)

        container.addMessageListener(
            MessageListenerAdapter(socketIOFanoutRedisMessageListener),
            websocketFanoutTopic,
        )

        return container
    }
}
