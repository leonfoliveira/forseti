package com.forsetijudge.core.infrastructure.sqs

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.output.queue.SubmissionQueueProducer
import com.forsetijudge.core.testcontainer.TestContainerLocalStack
import io.awspring.cloud.sqs.operations.SqsTemplate
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class SubmissionQueueSQSProducerIntegrationTest : TestContainerLocalStack() {
    private val queueName = "test-submission-queue"
    private val producer = SubmissionQueueSQSProducer(SqsTemplate.newTemplate(sqsAsyncClient), queueName)

    @Test
    fun `sends the message to the queue`() {
        val queueUrl = sqsAsyncClient.createQueue { it.queueName(queueName) }.get().queueUrl()
        val submissionId = UUID.randomUUID()

        producer.produce(
            SubmissionQueueProducer.Message(
                contestId = UUID.randomUUID(),
                submissionId = submissionId,
                language = Submission.Language.entries.first(),
                codeId = UUID.randomUUID(),
                codeFilename = "main.txt",
                timeLimitMs = 1000,
                memoryLimitMb = 256,
                testCasesId = UUID.randomUUID(),
            ),
        )

        val messages =
            sqsAsyncClient
                .receiveMessage { it.queueUrl(queueUrl).waitTimeSeconds(5).maxNumberOfMessages(1) }
                .get()
                .messages()
        assertEquals(1, messages.size)
        assertTrue(messages[0].body().contains(submissionId.toString()))
    }
}
