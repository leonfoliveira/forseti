package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.port.input.usecase.submission.FailSubmissionUseCase
import com.forsetijudge.core.util.SafeLogger
import io.awspring.cloud.sqs.annotation.SqsListener
import org.springframework.stereotype.Component
import java.util.UUID

@Component
@Suppress("unused")
class SubmissionFailedSQSConsumer(
    private val failSubmissionUseCase: FailSubmissionUseCase,
) {
    private val logger = SafeLogger(this::class)

    /**
     * Listens for messages from the submission failed SQS queue and processes them.
     * This queue is the DLQ for the submission queue, and messages in this queue indicate that a submission has failed to be processed.
     *
     * @param body The body of the message received from the SQS queue.
     */
    @SqsListener($$"${spring.cloud.aws.sqs.submission-failed-queue}")
    fun listen(body: Body) {
        logger.info("Received submission failed message for submissionId = ${body.submissionId}")

        failSubmissionUseCase.execute(
            FailSubmissionUseCase.Command(
                submissionId = body.submissionId,
            ),
        )
    }

    data class Body(
        val submissionId: UUID,
    )
}
