package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.port.input.usecase.contest.FreezeContestUseCase
import com.forsetijudge.core.util.SafeLogger
import io.awspring.cloud.sqs.annotation.SqsListener
import org.springframework.stereotype.Component
import java.util.UUID

@Component
@Suppress("unused")
class FreezeSQSConsumer(
    private val freezeContestUseCase: FreezeContestUseCase,
) {
    private val logger = SafeLogger(this::class)

    /**
     * Listens for messages from the freeze SQS queue and processes them.
     * This queue is used to notify the system that a contest has been frozen.
     *
     * @param body The body of the message received from the SQS queue.
     */
    @SqsListener($$"${spring.cloud.aws.sqs.freeze-queue}")
    fun listen(body: Body) {
        logger.info("Received freeze message for contestId = ${body.contestId}")

        try {
            freezeContestUseCase.execute(
                FreezeContestUseCase.Command(
                    contestId = body.contestId,
                    bypassMemberAuthorization = true,
                ),
            )
        } catch (e: ForbiddenException) {
            logger.warn("ForbiddenException while freezing contest with id ${body.contestId}: ${e.message}")
        }
    }

    data class Body(
        val contestId: UUID,
    )
}
