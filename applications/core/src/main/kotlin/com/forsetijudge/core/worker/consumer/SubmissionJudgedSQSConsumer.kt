package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.input.usecase.submission.JudgeSubmissionUseCase
import com.forsetijudge.core.util.SafeLogger
import io.awspring.cloud.sqs.annotation.SqsListener
import org.springframework.stereotype.Component
import java.util.UUID

@Component
@Suppress("unused")
class SubmissionJudgedSQSConsumer(
    private val judgeSubmissionUseCase: JudgeSubmissionUseCase,
) {
    private val logger = SafeLogger(this::class)

    /**
     * Listens for messages from the submission judged SQS queue and processes them.
     * This queue receives messages from the auto-judge service indicating that a submission has been judged.
     *
     * @param body The body of the message received from the SQS queue, containing the submission ID and the judged answer.
     */
    @SqsListener($$"${spring.cloud.aws.sqs.submission-judged-queue}")
    fun listen(body: Body) {
        logger.info("Received submission judged message for submissionId = ${body.submissionId}")

        judgeSubmissionUseCase.execute(
            JudgeSubmissionUseCase.Command(
                submissionId = body.submissionId,
                answer = body.answer,
            ),
        )
    }

    data class Body(
        val submissionId: UUID,
        val answer: Submission.Answer,
    )
}
