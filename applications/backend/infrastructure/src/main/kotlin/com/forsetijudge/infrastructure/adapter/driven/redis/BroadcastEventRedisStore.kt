package com.forsetijudge.infrastructure.adapter.driven.redis

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Component
import java.time.OffsetDateTime

@Component
class BroadcastEventRedisStore(
    val redisTemplate: RedisTemplate<String, BroadcastEvent>,
) {
    private val logger = SafeLogger(this::class)

    companion object {
        const val BROADCAST_EVENTS_KEY = "broadcast_events"
        const val MAX_SIZE = 100L
    }

    /**
     * Saves a broadcast event to Redis with the current timestamp as the score in a sorted set.
     * If the total number of events exceeds the defined maximum size, the oldest events will be removed to maintain the limit.
     *
     * @param event The broadcast event to be saved.
     */
    fun save(event: BroadcastEvent) {
        val timestamp = System.currentTimeMillis().toDouble()
        val key = "${BROADCAST_EVENTS_KEY}:${event.room}"
        logger.info("Saving broadcast event with id: ${event.id} with key = $key and timestamp: $timestamp")

        redisTemplate.opsForZSet().add(
            key,
            event,
            timestamp,
        )

        val count = redisTemplate.opsForZSet().size(key) ?: 0
        if (count > MAX_SIZE) {
            val removedCount = redisTemplate.opsForZSet().removeRange(key, 0, count - MAX_SIZE - 1)
            logger.info("Removed $removedCount old broadcast events to maintain max size of $MAX_SIZE")
        }
    }

    /**
     * Retrieves all broadcast events from Redis that have a timestamp greater than the provided timestamp.
     *
     * @param room The room for which to retrieve broadcast events.
     * @param timestamp The timestamp to filter events. Only events with a timestamp greater than this will be returned.
     * @return A list of broadcast events that occurred since the provided timestamp.
     */
    fun getAllSince(
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
