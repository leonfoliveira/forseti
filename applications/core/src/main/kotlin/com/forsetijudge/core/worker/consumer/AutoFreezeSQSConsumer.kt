package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.infrastructure.sqs.adapter.SQSConsumer
import com.forsetijudge.core.port.input.usecase.contest.AutoFreezeContestUseCase
import com.forsetijudge.core.util.SafeLogger
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.sqs.SqsClient
import tools.jackson.databind.ObjectMapper
import java.util.UUID

@Component
@Suppress("unused")
class AutoFreezeSQSConsumer(
    sqsClient: SqsClient,
    @Value($$"${aws.sqs.auto-freeze-queue-url}")
    queueUrl: String,
    private val autoFreezeContestUseCase: AutoFreezeContestUseCase,
    private val objectMapper: ObjectMapper,
) : SQSConsumer(sqsClient, queueUrl) {
    private val logger = SafeLogger(this::class)

    override fun handle(body: String) {
        val parsedBody = objectMapper.readValue(body, Body::class.java)

        logger.info("Received freeze message for contestId = ${parsedBody.contestId}")

        try {
            autoFreezeContestUseCase.execute(
                AutoFreezeContestUseCase.Command(
                    contestId = parsedBody.contestId,
                ),
            )
        } catch (e: ForbiddenException) {
            logger.warn("ForbiddenException while freezing contest with id ${parsedBody.contestId}: ${e.message}")
        }
    }

    data class Body(
        val contestId: UUID,
    )
}
