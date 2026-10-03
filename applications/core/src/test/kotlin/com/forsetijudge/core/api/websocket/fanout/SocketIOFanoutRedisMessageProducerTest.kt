package com.forsetijudge.core.api.websocket.fanout

import com.forsetijudge.core.infrastructure.redis.SocketIORedisCacheStore
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify

class SocketIOFanoutRedisMessageProducerTest {
    private val cacheStore = mock<SocketIORedisCacheStore>()
    private val producer = SocketIOFanoutRedisMessageProducer(cacheStore)

    @Test
    fun `publishes and caches produced payload in order`() {
        val message = SocketIOFanoutMessage("/room", "event", mapOf("value" to "payload"))

        producer.produce(message)

        verify(cacheStore).pubFanout(message)
        verify(cacheStore).cache(message)
    }
}
