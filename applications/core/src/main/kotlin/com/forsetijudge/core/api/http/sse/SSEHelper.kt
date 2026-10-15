package com.forsetijudge.core.api.http.sse

import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.util.SafeLogger
import java.util.concurrent.ConcurrentHashMap
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter

object SSEHelper {
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

        emitter.onCompletion { unsubscribe(room, emitter) }
        emitter.onTimeout { unsubscribe(room, emitter) }
        emitter.onError { unsubscribe(room, emitter) }
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
     * Emit an event to a room.
     *
     * @param message The message to be sent, containing the event room, name and data.
     */
    fun emit(message: SSEFanoutMessage) {
        logger.info("Emitting event ${message.eventName} to room ${message.room}")

        val roomEmitters = emitters[message.room]?.toList() ?: return

        for (emitter in roomEmitters) {
            try {
                emitter.send(message)
            } catch (e: Exception) {
                logger.error("Error sending SSE to room ${message.room}", e)
                unsubscribe(message.room, emitter)
            }
        }
    }
}
