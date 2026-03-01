package com.forsetijudge.infrastructure.adapter.driven.redis

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.port.driven.cache.SessionCache
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import java.util.UUID
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.toJavaDuration

@Component
class SessionRedisStore(
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper,
) : SessionCache {
    private val logger = SafeLogger(this::class)

    companion object {
        const val STORE_KEY = "session"
        const val TTL_MILLIS = 6 * 60 * 60 * 1000L
    }

    override fun cache(session: SessionResponseBodyDTO) {
        val key = "${STORE_KEY}:${session.id}"
        logger.info("Caching session with key $key")

        val rawSession = objectMapper.writeValueAsString(session)
        redisTemplate.opsForValue().set(key, rawSession)
        redisTemplate.expire(key, TTL_MILLIS.milliseconds.toJavaDuration())

        logger.info("Session cached successfully")
    }

    override fun get(id: UUID): SessionResponseBodyDTO? {
        val key = "${STORE_KEY}:$id"
        logger.info("Retrieving session with key $key")

        val rawSession = redisTemplate.opsForValue().get(key)
        if (rawSession == null) {
            logger.info("No session found for key $key")
            return null
        }

        val session = objectMapper.readValue(rawSession, SessionResponseBodyDTO::class.java)
        logger.info("Session retrieved successfully for key $key")
        return session
    }

    override fun evictAll(sessionIds: Collection<UUID>) {
        val keys = sessionIds.map { "${STORE_KEY}:$it" }
        logger.info("Deleting sessions with keys $keys")

        redisTemplate.delete(keys)

        logger.info("Sessions deleted successfully")
    }
}
