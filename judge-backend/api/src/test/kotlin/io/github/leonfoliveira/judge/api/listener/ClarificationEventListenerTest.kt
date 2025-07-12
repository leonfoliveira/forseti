package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.api.emitter.StompClarificationEmitter
import io.github.leonfoliveira.judge.common.event.ClarificationEvent
import io.github.leonfoliveira.judge.common.mock.entity.ClarificationMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class ClarificationEventListenerTest : FunSpec({
    val stompClarificationEmitter = mockk<StompClarificationEmitter>(relaxed = true)

    val sut = ClarificationEventListener(stompClarificationEmitter)

    beforeEach {
        clearAllMocks()
    }

    test("should emit clarification on event") {
        val clarification = ClarificationMockBuilder.build()
        val event = ClarificationEvent(this, clarification)

        sut.onApplicationEvent(event)

        verify { stompClarificationEmitter.emit(clarification) }
    }
})
