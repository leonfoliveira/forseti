package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.input.usecase.submission.JudgeSubmissionUseCase
import com.forsetijudge.core.util.SafeLogger
import io.awspring.cloud.sqs.annotation.SqsListener
import java.util.UUID
import org.springframework.stereotype.Component

@Component
@Suppress("unused")
class SubmissionJudgedSQSConsumer(
    private val judgeSubmissionUseCase: JudgeSubmissionUseCase,
) {
    private val logger = SafeLogger(this::class)

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
