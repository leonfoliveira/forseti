package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.port.input.usecase.submission.FailSubmissionUseCase
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify

class SubmissionFailedSQSConsumerTest {
    private val failSubmissionUseCase = mock<FailSubmissionUseCase>()
    private val consumer = SubmissionFailedSQSConsumer(failSubmissionUseCase)

    @Test
    fun `should call failSubmissionUseCase when listen is called with valid body`() {
        val submissionId = IdGenerator.getUUID()
        val body = SubmissionFailedSQSConsumer.Body(submissionId)

        consumer.listen(body)

        verify(failSubmissionUseCase).execute(
            FailSubmissionUseCase.Command(submissionId),
        )
    }
}
