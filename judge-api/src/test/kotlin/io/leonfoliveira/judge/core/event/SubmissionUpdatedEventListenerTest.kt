package io.leonfoliveira.judge.core.event

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import io.mockk.mockk
import io.mockk.verify

class SubmissionUpdatedEventListenerTest : FunSpec({
    val submissionEmitterAdapter = mockk<SubmissionEmitterAdapter>(relaxed = true)
    val event =
        SubmissionUpdatedEvent(
            source = this,
            submission = SubmissionMockFactory.build(),
        )

    val sut =
        SubmissionUpdatedEventListener(
            submissionEmitterAdapter = submissionEmitterAdapter,
        )

    test("should emit submission for member and contest") {
        sut.onApplicationEvent(event)

        verify {
            submissionEmitterAdapter.emitForMember(event.submission)
            submissionEmitterAdapter.emitForContest(event.submission)
        }
    }
})
