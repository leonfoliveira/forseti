package com.forsetijudge.core.api.http.sse

import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.infrastructure.redis.SSERedisCacheStore
import com.forsetijudge.core.util.SafeLogger
import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.concurrent.ConcurrentHashMap
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter

@Component
class SSEHelper(
    private val redisSSERedisCacheStore: SSERedisCacheStore,
) {
    private val logger = SafeLogger(this::class)
    private val emitters = ConcurrentHashMap<String, MutableSet<SseEmitter>>()

    /**
     * Subscribe to a room for SSE events.
     *
     * @param room The room to subscribe to.
     * @param emitter The SseEmitter to use for sending events.
     */
    fun subscribe(
        room: String,
        emitter: SseEmitter,
    ) {
        logger.info("New SSE subscription for room $room")

        val roomEmitters = emitters.computeIfAbsent(room) { ConcurrentHashMap.newKeySet() }
        roomEmitters.add(emitter)

        emitter.onCompletion {
            unsubscribe(room, emitter)
        }
        emitter.onTimeout {
            emitter.complete()
            unsubscribe(room, emitter)
        }
        emitter.onError {
            emitter.complete()
            unsubscribe(room, emitter)
        }
        emitter.send(SseEmitter.event().name("connect").data("connected"))
    }

    /**
     * Unsubscribe from a room for SSE events.
     *
     * @param room The room to unsubscribe from.
     * @param emitter The SseEmitter to remove from the room.
     */
    fun unsubscribe(
        room: String,
        emitter: SseEmitter,
    ) {
        logger.info("New SSE unsubscription for room $room")

        emitters[room]?.let { roomEmitters ->
            roomEmitters.remove(emitter)
            if (roomEmitters.isEmpty()) {
                emitters.remove(room, roomEmitters)
            }
        }
    }

    /**
     * Emit an event to a room. The id of the event is set to the timestamp of the message in milliseconds since epoch.
     *
     * @param message The message to be sent, containing the event room, name and data.
     */
    fun emit(message: SSEFanoutMessage) {
        logger.info("Emitting event ${message.eventName} to room ${message.room}")

        val roomEmitters = emitters[message.room]?.toList() ?: return

        for (emitter in roomEmitters) {
            try {
                emitter.send(
                    SseEmitter
                        .event()
                        .id(
                            message.createdAt
                                .toInstant()
                                .toEpochMilli()
                                .toString(),
                        ).name(message.eventName)
                        .data(message.data),
                )
            } catch (e: Exception) {
                logger.error("Error sending SSE to room ${message.room}", e)
                unsubscribe(message.room, emitter)
            }
        }
    }

    /**
     * Emit missed messages to a room after a specific event ID.
     *
     * @param room The room to emit missed messages to.
     * @param lastEventId The last event ID received by the client.
     * @param emitter The SseEmitter to use for sending events.
     */
    fun emitMissedMessages(
        room: String,
        lastEventId: String,
        emitter: SseEmitter,
    ) {
        logger.info("Emitting missed messages to room $room after lastEventId $lastEventId")

        val messages =
            redisSSERedisCacheStore.getAllMessagesByRoomAfterTimestamp(
                room,
                OffsetDateTime.ofInstant(
                    Instant.ofEpochMilli(lastEventId.toLong()),
                    ZoneOffset.UTC,
                ),
            )

        messages.forEach {
            try {
                emitter.send(
                    SseEmitter
                        .event()
                        .id(
                            it.createdAt
                                .toInstant()
                                .toEpochMilli()
                                .toString(),
                        ).name(it.eventName)
                        .data(it.data),
                )
            } catch (e: Exception) {
                logger.error("Error sending missed SSE to room $room", e)
                unsubscribe(room, emitter)
                return
            }
        }
    }

    /**
     * Send a heartbeat event to all rooms to keep the connections alive.
     */
    @Scheduled(fixedRate = 15000)
    fun heartbeat() {
        logger.info("Sending heartbeat to all rooms")
        for ((room, roomEmitters) in emitters) {
            for (emitter in roomEmitters.toList()) {
                try {
                    emitter.send(SseEmitter.event().name("heartbeat").data("heartbeat"))
                } catch (e: Exception) {
                    logger.error("Error sending heartbeat to room $room", e)
                    emitter.complete()
                    unsubscribe(room, emitter)
                }
            }
        }
    }
}
