package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.api.emitter.StompClarificationEmitter
import io.github.leonfoliveira.judge.common.event.ClarificationCreatedEvent
import io.github.leonfoliveira.judge.common.event.ClarificationDeletedEvent
import io.github.leonfoliveira.judge.common.mock.entity.ClarificationMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class ClarificationEventListenerTest :
    FunSpec({
        val stompClarificationEmitter = mockk<StompClarificationEmitter>(relaxed = true)

        val sut = ClarificationEventsApiListener(stompClarificationEmitter)

        beforeEach {
            clearAllMocks()
        }

        test("should emit clarification on created event") {
            val clarification = ClarificationMockBuilder.build()
            val event = ClarificationCreatedEvent(this, clarification)

            sut.onApplicationEvent(event)

            verify { stompClarificationEmitter.emit(clarification) }
        }

        test("should emit clarification on delete event") {
            val clarification = ClarificationMockBuilder.build()
            val event = ClarificationDeletedEvent(this, clarification)

            sut.onApplicationEvent(event)

            verify { stompClarificationEmitter.emitDeleted(clarification) }
        }
    })
