package live.forseti.api.adapter.driven.listener

import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import live.forseti.api.adapter.driven.emitter.StompClarificationEmitter
import live.forseti.core.domain.entity.ClarificationMockBuilder
import live.forseti.core.domain.event.ClarificationCreatedEvent
import live.forseti.core.domain.event.ClarificationDeletedEvent

class ClarificationEventListenerTest :
    FunSpec({
        val clarificationEmitter = mockk<StompClarificationEmitter>(relaxed = true)

        val sut = ClarificationEventsApiListener(clarificationEmitter)

        beforeEach {
            clearAllMocks()
        }

        test("should emit clarification on created event") {
            val clarification = ClarificationMockBuilder.build()
            val event = ClarificationCreatedEvent(this, clarification)

            sut.onApplicationEvent(event)

            verify { clarificationEmitter.emit(clarification) }
        }

        test("should emit clarification on delete event") {
            val clarification = ClarificationMockBuilder.build()
            val event = ClarificationDeletedEvent(this, clarification)

            sut.onApplicationEvent(event)

            verify { clarificationEmitter.emitDeleted(clarification) }
        }
    })
