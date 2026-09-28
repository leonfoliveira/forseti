package com.forsetijudge.core.infrastructure.redis

import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.output.cache.SessionCache
import com.forsetijudge.core.util.SafeLogger
import java.time.Duration
import java.time.OffsetDateTime
import java.util.UUID
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component
class SessionRedisCacheStore(
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper,
) : SessionCache {
    private val logger = SafeLogger(this::class)

    companion object {
        const val STORE_KEY = "session"
        const val MEMBER_STORE_KEY = "session_member"
    }

    /**
     * Stores the given session in the Redis cache. Using two indexes:
     * sessionId -> session and memberId -> sessionId
     */
    override fun cache(session: SessionResponseBodyDTO) {
        val key = "${STORE_KEY}:${session.id}"
        val memberKey = "${MEMBER_STORE_KEY}:${session.member.id}"
        val ttl = Duration.between(OffsetDateTime.now(), session.expiresAt)
        logger.info("Caching session with key $key")

        val rawSession = objectMapper.writeValueAsString(session)
        redisTemplate.opsForValue().set(key, rawSession, ttl)
        redisTemplate.opsForValue().set(memberKey, key, ttl)

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

    override fun evict(session: SessionResponseBodyDTO) {
        val key = "${STORE_KEY}:${session.id}"
        val memberKey = "${MEMBER_STORE_KEY}:${session.member.id}"
        logger.info("Evicting session with key $key and member key $memberKey")

        redisTemplate.delete(key)
        redisTemplate.delete(memberKey)

        logger.info("Session evicted successfully for key $key and member key $memberKey")
    }

    override fun evictByMemberId(memberId: UUID) {
        val memberKey = "${MEMBER_STORE_KEY}:$memberId"
        logger.info("Evicting sessions with member key $memberKey")

        val sessionKey = redisTemplate.opsForValue().get(memberKey)

        redisTemplate.delete(memberKey)
        if (sessionKey != null) {
            redisTemplate.delete(sessionKey)
        }

        logger.info("Session evicted successfully")
    }
}
