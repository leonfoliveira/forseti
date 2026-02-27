package com.forsetijudge.infrastructure.adapter.driven.redis

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.cache.BroadcastEventCacheStore
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import java.util.UUID
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.toJavaDuration

@Component
class BroadcastEventRedisStore(
    val redisTemplate: RedisTemplate<String, BroadcastEvent>,
) : BroadcastEventCacheStore {
    private val logger = SafeLogger(this::class)

    companion object {
        const val BROADCAST_EVENTS_KEY = "broadcast_events"
        const val MAX_SIZE = 100L
        const val TTL_MILLIS = 6 * 60 * 60 * 1000L
    }

    override fun add(event: BroadcastEvent) {
        val key = "${BROADCAST_EVENTS_KEY}:${event.room}"
        val timestamp = OffsetDateTime.now()
        logger.info("Saving broadcast event with key = $key and timestamp: $timestamp")

        redisTemplate.opsForZSet().add(
            key,
            event,
            timestamp
                .toInstant()
                .toEpochMilli()
                .toDouble(),
        )

        val count = redisTemplate.opsForZSet().size(key) ?: 0
        if (count > MAX_SIZE) {
            val removedCount = redisTemplate.opsForZSet().removeRange(key, 0, count - MAX_SIZE - 1)
            logger.info("Removed $removedCount old broadcast events to maintain max size of $MAX_SIZE")
        }
        redisTemplate.expire(key, TTL_MILLIS.milliseconds.toJavaDuration())
    }

    override fun getAllSince(
        room: String,
        timestamp: OffsetDateTime,
    ): List<BroadcastEvent> {
        val key = "${BROADCAST_EVENTS_KEY}:$room"
        logger.info("Retrieving broadcast events since: $timestamp with key: $key")

        val minScore = timestamp.toInstant().toEpochMilli().toDouble()
        val events =
            redisTemplate.opsForZSet().rangeByScore(key, minScore, Double.MAX_VALUE)?.toList()
                ?: emptyList()

        logger.info("Retrieved ${events.size} broadcast events")
        return events
    }
}
