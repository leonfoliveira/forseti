package com.forsetijudge.infrastructure.adapter.driven.redis

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.port.driven.cache.SessionCache
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import java.time.Duration
import java.time.OffsetDateTime
import java.util.UUID

@Component
class SessionRedisStore(
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper,
) : SessionCache {
    private val logger = SafeLogger(this::class)

    companion object {
        const val STORE_KEY = "session"
        const val MEMBER_STORE_KEY = "session_member"
    }

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

    override fun getByMemberId(memberId: UUID): SessionResponseBodyDTO? {
        val memberKey = "${MEMBER_STORE_KEY}:$memberId"
        logger.info("Retrieving session for member ID $memberId with member key $memberKey")

        val sessionKey = redisTemplate.opsForValue().get(memberKey)
        if (sessionKey.isNullOrEmpty()) {
            logger.info("No session key found for member key $memberKey")
            return null
        }

        logger.info("Retrieving session with key $sessionKey for member ID $memberId")

        val rawSession = redisTemplate.opsForValue().get(sessionKey)
        if (rawSession == null) {
            logger.info("No session found for key $sessionKey")
            return null
        }

        val session = objectMapper.readValue(rawSession, SessionResponseBodyDTO::class.java)
        logger.info("Session retrieved successfully for key $sessionKey and member ID $memberId")
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

    override fun evictAll(sessions: Collection<SessionResponseBodyDTO>) {
        val keys = sessions.map { "${STORE_KEY}:${it.id}" }.toSet()
        val memberKeys = sessions.map { "${MEMBER_STORE_KEY}:${it.member.id}" }.toSet()
        logger.info("Deleting sessions with keys $keys")

        redisTemplate.delete(keys + memberKeys)

        logger.info("Sessions deleted successfully")
    }
}
