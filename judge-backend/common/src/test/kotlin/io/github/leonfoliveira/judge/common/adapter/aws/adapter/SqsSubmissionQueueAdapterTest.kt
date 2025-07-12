package io.github.leonfoliveira.judge.common.adapter.aws.adapter

import io.github.leonfoliveira.judge.common.adapter.aws.SqsAdapter
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsSubmissionPayload
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.mockk.mockk
import io.mockk.verify

class SqsSubmissionQueueAdapterTest : FunSpec({
    val sqsAdapter = mockk<SqsAdapter>(relaxed = true)
    val submissionQueue = "test-submission-queue"

    val sut = SqsSubmissionQueueAdapter(sqsAdapter, submissionQueue)

    test("should call SqsAdapter to enqueue a submission") {
        val submission = SubmissionMockBuilder.build()

        sut.enqueue(submission)

        verify { sqsAdapter.enqueue(queue = submissionQueue, payload = SqsSubmissionPayload(submissionId = submission.id)) }
    }
})
