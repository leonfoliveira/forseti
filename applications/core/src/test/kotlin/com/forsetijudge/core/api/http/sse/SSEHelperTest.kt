package com.forsetijudge.core.api.http.sse

import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.doNothing
import org.mockito.kotlin.doThrow
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter

class SSEHelperTest {
    private val room = "test-room"
    private val eventName = "test-event"
    private val data = "test-data"

    @Test
    fun `subscribe should add emitter and register lifecycle callbacks`() {
        val emitter = mock<SseEmitter>()

        SSEHelper.subscribe(room, emitter)

        verify(emitter).onCompletion(any())
        verify(emitter).onTimeout(any())
        verify(emitter).onError(any())

        SSEHelper.unsubscribe(room, emitter)
    }

    @Test
    fun `emit should send event to all emitters in the room`() {
        val emitter1 = mock<SseEmitter>()
        val emitter2 = mock<SseEmitter>()

        SSEHelper.subscribe(room, emitter1)
        SSEHelper.subscribe(room, emitter2)

        SSEHelper.emit(room, eventName, data)

        verify(emitter1).send(any<SseEmitter.SseEventBuilder>())
        verify(emitter2).send(any<SseEmitter.SseEventBuilder>())

        SSEHelper.unsubscribe(room, emitter1)
        SSEHelper.unsubscribe(room, emitter2)
    }

    @Test
    fun `emit should not fail if an emitter throws an exception during send`() {
        val faultyEmitter = mock<SseEmitter>()
        val healthyEmitter = mock<SseEmitter>()

        doThrow(RuntimeException("Connection closed"))
            .whenever(faultyEmitter)
            .send(any<SseEmitter.SseEventBuilder>())

        SSEHelper.subscribe(room, faultyEmitter)
        SSEHelper.subscribe(room, healthyEmitter)

        SSEHelper.emit(room, eventName, data)

        verify(faultyEmitter).send(any<SseEmitter.SseEventBuilder>())
        verify(healthyEmitter).send(any<SseEmitter.SseEventBuilder>())

        SSEHelper.unsubscribe(room, faultyEmitter)
        SSEHelper.unsubscribe(room, healthyEmitter)
    }

    @Test
    fun `emit should do nothing if room does not exist`() {
        SSEHelper.emit("non-existent-room", eventName, data)
    }

    @Test
    fun `unsubscribe should remove emitter and clean up empty rooms`() {
        val emitter = mock<SseEmitter>()

        SSEHelper.subscribe(room, emitter)
        SSEHelper.emit(room, eventName, data)

        verify(emitter, times(1)).send(any<SseEmitter.SseEventBuilder>())

        SSEHelper.unsubscribe(room, emitter)

        SSEHelper.emit(room, eventName, data)
        verify(emitter, times(1)).send(any<SseEmitter.SseEventBuilder>()) // count shouldn't increase
    }

    @Test
    fun `completion or timeout callback should automatically unsubscribe emitter`() {
        val emitter = mock<SseEmitter>()
        val completionCaptor = argumentCaptor<Runnable>()

        doNothing().whenever(emitter).onCompletion(completionCaptor.capture())

        SSEHelper.subscribe(room, emitter)

        completionCaptor.firstValue.run()

        SSEHelper.emit(room, eventName, data)
        verify(emitter, never()).send(any<SseEmitter.SseEventBuilder>())
    }
}
