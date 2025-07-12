package io.github.leonfoliveira.judge.common.listener

import io.github.leonfoliveira.judge.common.event.SubmissionJudgeEvent
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.port.SubmissionQueueAdapter
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class SubmissionJudgeEventListenerTest : FunSpec({
    val submissionQueueAdapter = mockk<SubmissionQueueAdapter>(relaxed = true)

    val sut = SubmissionJudgeEventListener(submissionQueueAdapter)

    beforeEach {
        clearAllMocks()
    }

    test("should enqueue submission on event") {
        val submission = SubmissionMockBuilder.build()
        val event = SubmissionJudgeEvent(this, submission)

        sut.onApplicationEvent(event)

        verify { submissionQueueAdapter.enqueue(submission) }
    }
})
