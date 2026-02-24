package com.forsetijudge.api.adapter.driving.consumer

import com.forsetijudge.core.port.driven.producer.payload.SubmissionQueuePayload
import com.forsetijudge.core.port.driving.usecase.external.submission.FailSubmissionUseCase
import com.forsetijudge.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class FailedSubmissionRabbitMQConsumer(
    private val failSubmissionUseCase: FailSubmissionUseCase,
) : RabbitMQConsumer<SubmissionQueuePayload>() {
    @RabbitListener(queues = ["\${spring.rabbitmq.queue.submission-failed-queue}"])
    override fun receiveMessage(jsonMessage: String) {
        super.receiveMessage(jsonMessage)
    }

    override fun getPayloadType(): Class<SubmissionQueuePayload> = SubmissionQueuePayload::class.java

    /**
     * Handles the failed submission payload by marking the submission as failed.
     *
     * @param payload The payload containing the submission ID.
     */
    override fun handlePayload(payload: SubmissionQueuePayload) {
        logger.info("Handling failed submission with ID: ${payload.submissionId}")
        failSubmissionUseCase.execute(
            FailSubmissionUseCase.Command(submissionId = payload.submissionId),
        )
    }
}
