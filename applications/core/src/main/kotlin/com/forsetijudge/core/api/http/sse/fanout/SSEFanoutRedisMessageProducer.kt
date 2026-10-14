package com.forsetijudge.core.api.http.sse.fanout

import com.forsetijudge.core.infrastructure.redis.SSERedisCacheStore
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component

@Component
class SSEFanoutRedisMessageProducer(
    private val sseRedisCacheStore: SSERedisCacheStore,
) {
    private val logger = SafeLogger(this::class)

    fun produce(payload: SSEFanoutMessage) {
        logger.info("Producing message for room: ${payload.room}, event: ${payload.eventName}")

        sseRedisCacheStore.pubFanout(payload)
        sseRedisCacheStore.cache(payload)
    }
}
