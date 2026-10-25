package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.infrastructure.sqs.adapter.SQSConsumer
import com.forsetijudge.core.port.input.usecase.submission.FailSubmissionUseCase
import com.forsetijudge.core.util.SafeLogger
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.sqs.SqsClient
import tools.jackson.databind.ObjectMapper
import java.util.UUID

@Component
@Suppress("unused")
class SubmissionFailedSQSConsumer(
    sqsClient: SqsClient,
    @Value($$"${aws.sqs.submission-failed-queue-url}")
    queueUrl: String,
    private val failSubmissionUseCase: FailSubmissionUseCase,
    private val objectMapper: ObjectMapper,
) : SQSConsumer(sqsClient, queueUrl) {
    private val logger = SafeLogger(this::class)

    override fun handle(body: String) {
        val parsedBody = objectMapper.readValue(body, Body::class.java)

        logger.info("Received submission failed message for submissionId = ${parsedBody.submissionId}")

        failSubmissionUseCase.execute(
            FailSubmissionUseCase.Command(
                submissionId = parsedBody.submissionId,
            ),
        )
    }

    data class Body(
        val submissionId: UUID,
    )
}
