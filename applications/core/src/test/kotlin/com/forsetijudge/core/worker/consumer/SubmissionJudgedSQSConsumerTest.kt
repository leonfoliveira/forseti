package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.input.usecase.submission.JudgeSubmissionUseCase
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.kotlin.verify
import software.amazon.awssdk.services.sqs.SqsClient
import tools.jackson.module.kotlin.jacksonObjectMapper

class SubmissionJudgedSQSConsumerTest {
    private val sqsClient = org.mockito.kotlin.mock<SqsClient>()
    private val judgeSubmissionUseCase = mock<JudgeSubmissionUseCase>()
    private val objectMapper = jacksonObjectMapper()
    private val consumer =
        SubmissionJudgedSQSConsumer(sqsClient, "submission-judged-queue", judgeSubmissionUseCase, objectMapper)

    @Test
    fun `should call judgeSubmissionUseCase when listen is called with valid body`() {
        val submissionId = java.util.UUID.randomUUID()
        val answer = Submission.Answer.ACCEPTED
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

        consumer.handle(objectMapper.writeValueAsString(body))

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
