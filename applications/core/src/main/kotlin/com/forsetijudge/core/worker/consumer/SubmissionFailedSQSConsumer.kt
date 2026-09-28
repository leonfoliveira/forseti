package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.port.input.usecase.submission.FailSubmissionUseCase
import com.forsetijudge.core.util.SafeLogger
import io.awspring.cloud.sqs.annotation.SqsListener
import java.util.UUID
import org.springframework.stereotype.Component

@Component
@Suppress("unused")
class SubmissionFailedSQSConsumer(
    private val failSubmissionUseCase: FailSubmissionUseCase,
) {
    private val logger = SafeLogger(this::class)

    @SqsListener($$"${sprinb.cloud.aws.sqs.queue.submission-failed-queue}")
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
