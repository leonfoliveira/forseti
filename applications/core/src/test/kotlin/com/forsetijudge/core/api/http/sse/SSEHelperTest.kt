package com.forsetijudge.core.api.http.sse

import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.atLeastOnce
import org.mockito.kotlin.atMost
import org.mockito.kotlin.doNothing
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter

class SSEHelperTest {
    private val room = "test-room"
    private val eventName = "test-event"
    private val data = "test-data"
    val helper = SSEHelper()

    @Test
    fun `subscribe should add emitter and register lifecycle callbacks`() {
        val emitter = mock<SseEmitter>()

        helper.subscribe(room, emitter)

        verify(emitter).onCompletion(any())
        verify(emitter).onTimeout(any())
        verify(emitter).onError(any())
        verify(emitter).send(any<SseEmitter.SseEventBuilder>())

        helper.unsubscribe(room, emitter)
    }

    @Test
    fun `emit should send event to all emitters in the room`() {
        val emitter1 = mock<SseEmitter>()
        val emitter2 = mock<SseEmitter>()

        helper.subscribe(room, emitter1)
        helper.subscribe(room, emitter2)

        val message = SSEFanoutMessage(room, eventName, data)
        helper.emit(message)

        verify(emitter1, atLeastOnce()).send(any<SseEmitter.SseEventBuilder>())
        verify(emitter2, atLeastOnce()).send(any<SseEmitter.SseEventBuilder>())

        helper.unsubscribe(room, emitter1)
        helper.unsubscribe(room, emitter2)
    }

    @Test
    fun `emit should do nothing if room does not exist`() {
        val message = SSEFanoutMessage("non-existent-room", eventName, data)
        helper.emit(message)
    }

    @Test
    fun `unsubscribe should remove emitter and clean up empty rooms`() {
        val emitter = mock<SseEmitter>()
        val message = SSEFanoutMessage(room, eventName, data)

        helper.subscribe(room, emitter)
        helper.emit(message)

        verify(emitter, atLeastOnce()).send(any<SseEmitter.SseEventBuilder>())

        helper.unsubscribe(room, emitter)

        helper.emit(message)
        verify(emitter, atLeastOnce()).send(any<SseEmitter.SseEventBuilder>()) // count shouldn't increase
    }

    @Test
    fun `completion or timeout callback should automatically unsubscribe emitter`() {
        val emitter = mock<SseEmitter>()
        val completionCaptor = argumentCaptor<Runnable>()
        val message = SSEFanoutMessage(room, eventName, data)
        doNothing().whenever(emitter).onCompletion(completionCaptor.capture())

        helper.subscribe(room, emitter)

        completionCaptor.firstValue.run()

        helper.emit(message)
        verify(emitter, atMost(1)).send(any<SseEmitter.SseEventBuilder>())
    }
}
