package io.leonfoliveira.judge.core.event

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import io.mockk.mockk
import io.mockk.verify

class SubmissionEventListenerTest : FunSpec({
    val submissionEmitterAdapter = mockk<SubmissionEmitterAdapter>(relaxed = true)
    val event =
        SubmissionEvent(
            source = this,
            submission = SubmissionMockFactory.build(),
        )

    val sut =
        SubmissionEventListener(
            submissionEmitterAdapter = submissionEmitterAdapter,
        )

    test("should emit submission for contest") {
        sut.onApplicationEvent(event)

        verify {
            submissionEmitterAdapter.emitForContest(event.submission)
        }
    }
})
