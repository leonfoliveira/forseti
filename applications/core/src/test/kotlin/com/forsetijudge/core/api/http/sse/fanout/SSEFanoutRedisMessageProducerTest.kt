package com.forsetijudge.core.api.http.sse.fanout

import com.forsetijudge.core.infrastructure.redis.SSERedisCacheStore
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify

class SSEFanoutRedisMessageProducerTest {
    private val sseRedisCacheStore = mock<SSERedisCacheStore>()
    private val producer = SSEFanoutRedisMessageProducer(sseRedisCacheStore)

    @Test
    fun `test produce method`() {
        val message =
            SSEFanoutMessage(
                room = "test-room",
                eventName = "test-event",
                data = "test-data",
            )

        producer.produce(message)

        verify(sseRedisCacheStore).pubFanout(message)
        verify(sseRedisCacheStore).cache(message)
    }
}
