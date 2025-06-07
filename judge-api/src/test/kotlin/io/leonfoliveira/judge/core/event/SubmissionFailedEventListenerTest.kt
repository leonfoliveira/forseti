package io.leonfoliveira.judge.core.event

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import io.mockk.mockk
import io.mockk.verify

class SubmissionFailedEventListenerTest : FunSpec({
    val submissionEmitterAdapter = mockk<SubmissionEmitterAdapter>(relaxed = true)
    val event =
        SubmissionFailedEvent(
            source = this,
            submission = SubmissionMockFactory.build(),
        )

    val sut =
        SubmissionFailedEventListener(
            submissionEmitterAdapter = submissionEmitterAdapter,
        )

    test("should emit submission for member and contest") {
        sut.onApplicationEvent(event)

        verify {
            submissionEmitterAdapter.emitFail(event.submission)
        }
    }
})
