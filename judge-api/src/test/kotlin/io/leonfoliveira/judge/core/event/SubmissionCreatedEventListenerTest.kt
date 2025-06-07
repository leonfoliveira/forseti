package io.leonfoliveira.judge.core.event

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import io.leonfoliveira.judge.core.port.SubmissionQueueAdapter
import io.mockk.mockk
import io.mockk.verify

class SubmissionCreatedEventListenerTest : FunSpec({
    val submissionQueueAdapter = mockk<SubmissionQueueAdapter>(relaxed = true)
    val submissionEmitterAdapter = mockk<SubmissionEmitterAdapter>(relaxed = true)
    val event =
        SubmissionCreatedEvent(
            source = this,
            submission = SubmissionMockFactory.build(),
        )

    val sut =
        SubmissionCreatedEventListener(
            submissionQueueAdapter = submissionQueueAdapter,
            submissionEmitterAdapter = submissionEmitterAdapter,
        )

    test("should enqueue emit and submission contest") {
        sut.onApplicationEvent(event)

        verify {
            submissionQueueAdapter.enqueue(event.submission)
            submissionEmitterAdapter.emitForContest(event.submission)
        }
    }
})
