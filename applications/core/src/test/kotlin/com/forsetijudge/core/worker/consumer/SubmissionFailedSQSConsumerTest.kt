package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.port.input.usecase.submission.FailSubmissionUseCase
import com.forsetijudge.core.testcontainer.TestContainerLocalStack
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import tools.jackson.module.kotlin.jacksonObjectMapper

class SubmissionFailedSQSConsumerTest : TestContainerLocalStack() {
    private val queueName = "submission-failed-queue"
    private val queueUrl = sqsAsyncClient.createQueue { it.queueName(queueName) }.get().queueUrl()
    private val failSubmissionUseCase = mock<FailSubmissionUseCase>()
    private val objectMapper = jacksonObjectMapper()
    private val consumer = SubmissionFailedSQSConsumer(sqsClient, queueUrl, failSubmissionUseCase, objectMapper)

    @Test
    fun `should call failSubmissionUseCase when listen is called with valid body`() {
        val submissionId = IdGenerator.getUUID()
        val body = SubmissionFailedSQSConsumer.Body(submissionId)

        consumer.handle(objectMapper.writeValueAsString(body))

        verify(failSubmissionUseCase).execute(
            FailSubmissionUseCase.Command(submissionId),
        )
    }
}
