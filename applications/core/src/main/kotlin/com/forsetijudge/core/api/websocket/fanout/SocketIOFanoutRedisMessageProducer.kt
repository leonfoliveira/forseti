package com.forsetijudge.core.api.websocket.fanout

import com.forsetijudge.core.infrastructure.redis.SocketIORedisCacheStore
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component

@Component
class SocketIOFanoutRedisMessageProducer(
    private val socketIORedisCacheStore: SocketIORedisCacheStore,
) {
    private val logger = SafeLogger(this::class)

    fun produce(payload: SocketIOFanoutMessage) {
        logger.info("Producing message for room: ${payload.room}, event: ${payload.eventName}")

        socketIORedisCacheStore.pubFanout(payload)
        socketIORedisCacheStore.cache(payload)
    }
}
