package com.forsetijudge.core.infrastructure.redis

import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.testcontainer.TestContainerRedis
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.Duration
import java.util.UUID

class SessionRedisCacheStoreIntegrationTest : TestContainerRedis() {
    private val store = SessionRedisCacheStore(redisTemplate, objectMapper)

    @Test
    fun `caches a session with ttl and reads it back`() {
        val session = MockModelFactory.session()

        store.cache(session)

        assertEquals(session.copy(expiresAt = store.get(session.id)!!.expiresAt), store.get(session.id))
        assertEquals(session.id.toString(), redisTemplate.opsForValue().get("session:member:${session.member.id}"))
        val ttl = redisTemplate.getExpire("session:${session.id}")
        assertTrue(ttl in 1..Duration.ofHours(1).seconds)
    }

    @Test
    fun `returns null for unknown session`() {
        assertNull(store.get(UUID.randomUUID()))
    }

    @Test
    fun `evicts session and its member index`() {
        val session = MockModelFactory.session()
        store.cache(session)

        store.evict(session)

        assertNull(store.get(session.id))
        assertNull(redisTemplate.opsForValue().get("session:member:${session.member.id}"))
    }

    @Test
    fun `evicts session by member id`() {
        val session = MockModelFactory.session()
        store.cache(session)
        assertNotNull(store.get(session.id))

        store.evictByMemberId(session.member.id)

        assertNull(store.get(session.id))
    }
}
