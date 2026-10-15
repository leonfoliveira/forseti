package com.forsetijudge.core.infrastructure.redis

import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.util.SafeLogger
import java.time.OffsetDateTime
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component
class SSERedisCacheStore(
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper,
    @Value($$"${spring.data.redis.sse_ttl_seconds}")
    private val ttlSeconds: Long,
) {
    private val logger = SafeLogger(this::class)

    companion object {
        const val FANOUT_TOPIC = "sse_fanout_topic"
        private const val MESSAGE_STORE_KEY = "sse_messages"
    }

    fun pubFanout(message: SSEFanoutMessage) {
        redisTemplate.convertAndSend(FANOUT_TOPIC, objectMapper.writeValueAsString(message))
    }

    /**
     * Caches a SSEFanoutMessage in Redis using a sorted set.
     * The message is stored with the current timestamp as the score.
     *
     * @param message The SSEFanoutMessage to cache.
     */
    fun cache(message: SSEFanoutMessage) {
        val key = "$MESSAGE_STORE_KEY:${message.room}"
        logger.info("Caching message with key = $key")

        redisTemplate
            .opsForZSet()
            .add(
                key,
                objectMapper.writeValueAsString(message),
                message.createdAt
                    .toInstant()
                    .toEpochMilli()
                    .toDouble(),
            )

        clean(message.room)
    }

    /**
     * Retrieves all SSEFanoutMessage for a given room that were cached after the specified timestamp.
     *
     * @param room The room identifier to filter messages.
     * @param timestamp The timestamp to filter messages that were cached after this time.
     * @return A list of SSEFanoutMessage that match the criteria.
     */
    fun getAllMessagesByRoomAfterTimestamp(
        room: String,
        timestamp: OffsetDateTime,
    ): List<SSEFanoutMessage> {
        val key = "$MESSAGE_STORE_KEY:$room"
        logger.info("Retrieving all messages with key after timestamp: $timestamp")

        val minScore = timestamp.toInstant().toEpochMilli().toDouble()
        val maxScore = Double.MAX_VALUE

        val rawMessages = redisTemplate.opsForZSet().rangeByScore(key, minScore, maxScore)

        if (rawMessages.isNullOrEmpty()) {
            logger.info("No messages found for room: $room after timestamp: $timestamp")
            return emptyList()
        }

        return rawMessages.map { rawMessage ->
            objectMapper.readValue(rawMessage, SSEFanoutMessage::class.java)
        }
    }

    /**
     * Cleans up messages older than 10 minutes for a given room.
     *
     * @param room The room identifier to clean up messages.
     */
    fun clean(room: String) {
        val key = "$MESSAGE_STORE_KEY:$room"

        val threshold = System.currentTimeMillis() - ttlSeconds * 1000
        redisTemplate.opsForZSet().removeRangeByScore(key, 0.0, threshold.toDouble())
        logger.info("Cleaned up messages older than 10 minutes for room: $room")
    }
}
