package io.leonfoliveira.judge.adapter.aws

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import software.amazon.awssdk.services.sqs.SqsClient
import software.amazon.awssdk.services.sqs.model.SendMessageRequest
import kotlin.toString

class SqsQueueAdapterTest : FunSpec({
    val sqsClient = mockk<SqsClient>()
    val submissionQueue = "submission-queue"

    val sut =
        SqsQueueAdapter(
            sqsClient = sqsClient,
            submissionQueue = submissionQueue,
        )

    context("enqueue") {
        test("should enqueue the submission") {
            val submission = SubmissionMockFactory.build()
            val requestSlot = slot<SendMessageRequest>()

            every { sqsClient.sendMessage(capture(requestSlot)) } returns null

            sut.enqueue(submission)

            requestSlot.captured.queueUrl() shouldBe submissionQueue
            requestSlot.captured.messageBody() shouldBe submission.id.toString()
        }
    }
})
