package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.infrastructure.sqs.adapter.SQSConsumer
import com.forsetijudge.core.port.input.usecase.submission.JudgeSubmissionUseCase
import com.forsetijudge.core.util.SafeLogger
import java.util.UUID
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.sqs.SqsClient
import tools.jackson.databind.ObjectMapper

@Component
@Suppress("unused")
class SubmissionJudgedSQSConsumer(
    sqsClient: SqsClient,
    @Value($$"${aws.sqs.submission-judged-queue-url}")
    queueUrl: String,
    private val judgeSubmissionUseCase: JudgeSubmissionUseCase,
    private val objectMapper: ObjectMapper,
) : SQSConsumer(sqsClient, queueUrl) {
    private val logger = SafeLogger(this::class)

    override fun handle(body: String) {
        val parsedBody = objectMapper.readValue(body, Body::class.java)

        logger.info("Received submission judged message for submissionId = ${parsedBody.submissionId}")

        judgeSubmissionUseCase.execute(
            JudgeSubmissionUseCase.Command(
                submissionId = parsedBody.submissionId,
                answer = parsedBody.answer,
                totalTestCases = parsedBody.totalTestCases,
                approvedTestCases = parsedBody.approvedTestCases,
                maxCpuTimeMs = parsedBody.maxCpuTimeMs,
                maxClockTimeMs = parsedBody.maxClockTimeMs,
                maxPeakMemoryKb = parsedBody.maxPeakMemoryKb,
                detailsId = parsedBody.detailsId,
            ),
        )
    }

    data class Body(
        val submissionId: UUID,
        val answer: Submission.Answer,
        val totalTestCases: Int,
        val approvedTestCases: Int,
        val maxCpuTimeMs: Long?,
        val maxClockTimeMs: Long?,
        val maxPeakMemoryKb: Long?,
        val detailsId: UUID?,
    )
}
