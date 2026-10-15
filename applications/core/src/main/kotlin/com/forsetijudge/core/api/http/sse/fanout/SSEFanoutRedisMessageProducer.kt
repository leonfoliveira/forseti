package com.forsetijudge.core.api.http.sse.fanout

import com.forsetijudge.core.infrastructure.redis.SSERedisCacheStore
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component

@Component
class SSEFanoutRedisMessageProducer(
    private val sseRedisCacheStore: SSERedisCacheStore,
) {
    private val logger = SafeLogger(this::class)

    fun produce(message: SSEFanoutMessage) {
        logger.info("Producing message for room: ${message.room}, event: ${message.eventName}")

        sseRedisCacheStore.pubFanout(message)
        sseRedisCacheStore.cache(message)
    }
}
