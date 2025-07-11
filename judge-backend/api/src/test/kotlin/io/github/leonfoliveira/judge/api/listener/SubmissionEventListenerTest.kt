package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.api.emitter.StompSubmissionEmitter
import io.github.leonfoliveira.judge.common.event.SubmissionEvent
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class SubmissionEventListenerTest : FunSpec({
    val stompSubmissionEmitter = mockk<StompSubmissionEmitter>(relaxed = true)

    val sut = SubmissionEventListener(stompSubmissionEmitter)

    beforeEach {
        clearAllMocks()
    }

    test("should emit submission on event") {
        val submission = SubmissionMockBuilder.build()
        val event = SubmissionEvent(this, submission)

        sut.onApplicationEvent(event)

        verify { stompSubmissionEmitter.emit(submission) }
    }
})
