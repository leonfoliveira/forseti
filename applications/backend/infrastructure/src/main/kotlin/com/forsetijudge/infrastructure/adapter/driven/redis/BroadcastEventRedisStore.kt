package com.forsetijudge.infrastructure.adapter.driven.redis

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.cache.BroadcastEventCacheStore
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.toJavaDuration

@Component
class BroadcastEventRedisStore(
    val redisTemplate: StringRedisTemplate,
    val objectMapper: ObjectMapper,
) : BroadcastEventCacheStore {
    private val logger = SafeLogger(this::class)

    companion object {
        const val STORE_KEY = "broadcast_events"
        const val MAX_SIZE = 100L
        const val TTL_MILLIS = 6 * 60 * 60 * 1000L
    }

    override fun cache(event: BroadcastEvent) {
        val roomKey = "${STORE_KEY}:${event.room}"
        val timestamp = OffsetDateTime.now()
        logger.info("Saving broadcast event with roomKey = $roomKey and timestamp: $timestamp")

        val rawEvent = objectMapper.writeValueAsString(event)
        redisTemplate.opsForZSet().add(
            roomKey,
            rawEvent,
            timestamp
                .toInstant()
                .toEpochMilli()
                .toDouble(),
        )
        clean(roomKey)

        logger.info("Broadcast event cached successfully")
    }

    override fun getAllSince(
        room: String,
        timestamp: OffsetDateTime,
    ): List<BroadcastEvent> {
        val key = "${STORE_KEY}:$room"
        logger.info("Retrieving broadcast events since: $timestamp with key: $key")

        val minScore = timestamp.toInstant().toEpochMilli().toDouble()
        val rawEvents =
            redisTemplate.opsForZSet().rangeByScore(key, minScore, Double.MAX_VALUE)?.toList()
                ?: emptyList()
        val events =
            rawEvents.map { rawEvent ->
                objectMapper.readValue(rawEvent, BroadcastEvent::class.java)
            }

        logger.info("Retrieved ${events.size} broadcast events")
        return events
    }

    /**
     * Clean up old broadcast events to maintain a maximum size of the sorted set and prevent stale data from accumulating in Redis.
     *
     * @param roomKey The key of the room for which to clean up old broadcast events.
     */
    private fun clean(roomKey: String) {
        val count = redisTemplate.opsForZSet().size(roomKey) ?: 0
        if (count > MAX_SIZE) {
            val removedCount = redisTemplate.opsForZSet().removeRange(roomKey, 0, count - MAX_SIZE - 1)
            logger.info("Removed $removedCount old broadcast events to maintain max size of $MAX_SIZE")
        }
        redisTemplate.expire(roomKey, TTL_MILLIS.milliseconds.toJavaDuration())
    }
}
