package com.forsetijudge.core.infrastructure.redis

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutMessage
import com.forsetijudge.core.testcontainer.TestContainerRedis
import java.time.OffsetDateTime
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.springframework.data.redis.listener.ChannelTopic
import org.springframework.data.redis.listener.RedisMessageListenerContainer

class SocketIORedisCacheStoreIntegrationTest : TestContainerRedis() {
    private val store = SocketIORedisCacheStore(redisTemplate, objectMapper, 600)

    @Test
    fun `caches messages and filters them by room and timestamp`() {
        val before = OffsetDateTime.now().minusSeconds(1)
        store.cache(SocketIOFanoutMessage("room-1", "event", mapOf("a" to 1)))
        store.cache(SocketIOFanoutMessage("room-2", "other", mapOf("b" to 2)))

        val messages = store.getAllMessagesByRoomAfterTimestamp("room-1", before)

        assertEquals(1, messages.size)
        assertEquals("room-1", messages[0].room)
        assertEquals("event", messages[0].eventName)
        assertEquals(
            emptyList<Any>(),
            store.getAllMessagesByRoomAfterTimestamp("room-1", OffsetDateTime.now().plusMinutes(1)),
        )
    }

    @Test
    fun `publishes fanout message to subscribers of the topic`() {
        val received = LinkedBlockingQueue<String>()
        val container = RedisMessageListenerContainer()
        container.setConnectionFactory(connectionFactory)
        container.addMessageListener(
            { message, _ -> received.add(String(message.body)) },
            ChannelTopic(SocketIORedisCacheStore.FANOUT_TOPIC),
        )
        container.afterPropertiesSet()
        container.start()

        try {
            Thread.sleep(500)
            store.pubFanout(SocketIOFanoutMessage("room-1", "event", mapOf("a" to 1)))

            val raw = received.poll(5, TimeUnit.SECONDS)
            assertNotNull(raw)
            val message = objectMapper.readValue(raw, SocketIOFanoutMessage::class.java)
            assertEquals("room-1", message.room)
            assertEquals("event", message.eventName)
        } finally {
            container.stop()
            container.destroy()
        }
    }
}
