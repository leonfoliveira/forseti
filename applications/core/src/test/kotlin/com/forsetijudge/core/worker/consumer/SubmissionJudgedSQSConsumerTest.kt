package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.input.usecase.submission.JudgeSubmissionUseCase
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.kotlin.verify

class SubmissionJudgedSQSConsumerTest {
    private val judgeSubmissionUseCase = mock<JudgeSubmissionUseCase>()
    private val consumer = SubmissionJudgedSQSConsumer(judgeSubmissionUseCase)

    @Test
    fun `should call judgeSubmissionUseCase when listen is called with valid body`() {
        val submissionId = java.util.UUID.randomUUID()
        val answer = mock<Submission.Answer>()
        val body =
            SubmissionJudgedSQSConsumer.Body(
                submissionId = submissionId,
                answer = answer,
                totalTestCases = 10,
                approvedTestCases = 10,
                maxCpuTimeMs = 1000L,
                maxClockTimeMs = 2000L,
                maxPeakMemoryKb = 512L,
                detailsId = null,
            )

        consumer.listen(body)

        verify(judgeSubmissionUseCase).execute(
            JudgeSubmissionUseCase.Command(
                submissionId = submissionId,
                answer = answer,
                totalTestCases = 10,
                approvedTestCases = 10,
                maxCpuTimeMs = 1000L,
                maxClockTimeMs = 2000L,
                maxPeakMemoryKb = 512L,
                detailsId = null,
            ),
        )
    }
}
