package io.github.leonfoliveira.forseti.api.listener

import io.github.leonfoliveira.forseti.api.emitter.StompClarificationEmitter
import io.github.leonfoliveira.forseti.common.domain.event.ClarificationCreatedEvent
import io.github.leonfoliveira.forseti.common.domain.event.ClarificationDeletedEvent
import io.github.leonfoliveira.forseti.common.mock.entity.ClarificationMockBuilder
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
