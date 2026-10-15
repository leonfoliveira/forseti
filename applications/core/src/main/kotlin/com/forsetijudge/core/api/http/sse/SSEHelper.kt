package com.forsetijudge.core.api.http.sse

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
     * @param room The room to emit the event to.
     * @param eventName The name of the event.
     * @param data The data to send with the event.
     */
    fun emit(
        room: String,
        eventName: String,
        data: Any,
    ) {
        logger.info("Emitting event $eventName to room $room")

        val roomEmitters = emitters[room]?.toList() ?: return

        for (emitter in roomEmitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data))
            } catch (e: Exception) {
                logger.error("Error sending SSE to room $room", e)
                unsubscribe(room, emitter)
            }
        }
    }
}
