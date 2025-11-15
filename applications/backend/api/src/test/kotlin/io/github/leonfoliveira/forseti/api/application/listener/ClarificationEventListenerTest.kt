package io.github.leonfoliveira.forseti.api.application.listener

import io.github.leonfoliveira.forseti.api.application.port.driven.ClarificationEmitter
import io.github.leonfoliveira.forseti.common.application.domain.event.ClarificationCreatedEvent
import io.github.leonfoliveira.forseti.common.application.domain.event.ClarificationDeletedEvent
import io.github.leonfoliveira.forseti.common.mock.entity.ClarificationMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class ClarificationEventListenerTest :
    FunSpec({
        val clarificationEmitter = mockk<ClarificationEmitter>(relaxed = true)

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
