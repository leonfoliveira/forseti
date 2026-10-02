package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.port.input.usecase.submission.JudgeSubmissionUseCase
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock

class SubmissionJudgedSQSConsumerTest {
    private val judgeSubmissionUseCase = mock<JudgeSubmissionUseCase>()
    private val consumer = SubmissionJudgedSQSConsumer(judgeSubmissionUseCase)

    @Test
    fun `should call judgeSubmissionUseCase when listen is called with valid body`() {
        val submissionId = java.util.UUID.randomUUID()
        val answer = mock<com.forsetijudge.core.domain.entity.Submission.Answer>()
        val body = SubmissionJudgedSQSConsumer.Body(submissionId, answer)

        consumer.listen(body)

        org.mockito.Mockito.verify(judgeSubmissionUseCase).execute(
            JudgeSubmissionUseCase.Command(submissionId, answer),
        )
    }
}
