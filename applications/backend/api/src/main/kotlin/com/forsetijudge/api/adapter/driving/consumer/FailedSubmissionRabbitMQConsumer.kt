package com.forsetijudge.api.adapter.driving.consumer

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.submission.UpdateSubmissionUseCase
import com.forsetijudge.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import com.forsetijudge.infrastructure.adapter.dto.message.payload.SubmissionMessagePayload
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class FailedSubmissionRabbitMQConsumer(
    private val updateSubmissionUseCase: UpdateSubmissionUseCase,
) : RabbitMQConsumer<SubmissionMessagePayload>(Member.API_ID) {
    @RabbitListener(queues = ["\${spring.rabbitmq.queue.submission-failed-queue}"])
    override fun receiveMessage(jsonMessage: String) {
        super.receiveMessage(jsonMessage)
    }

    override fun getPayloadType(): Class<SubmissionMessagePayload> = SubmissionMessagePayload::class.java

    /**
     * Handles the failed submission payload by marking the submission as failed.
     *
     * @param payload The payload containing the submission ID.
     */
    override fun handlePayload(payload: SubmissionMessagePayload) {
        updateSubmissionUseCase.fail(payload.submissionId)
    }
}
