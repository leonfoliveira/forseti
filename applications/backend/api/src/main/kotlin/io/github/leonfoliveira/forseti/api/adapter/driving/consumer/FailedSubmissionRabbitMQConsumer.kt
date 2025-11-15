package io.github.leonfoliveira.forseti.api.adapter.driving.consumer

import io.github.leonfoliveira.forseti.common.adapter.driven.rabbitmq.RabbitMQConsumer
import io.github.leonfoliveira.forseti.common.adapter.driven.rabbitmq.message.SubmissionMessagePayload
import io.github.leonfoliveira.forseti.common.application.port.driving.UpdateSubmissionUseCase
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class FailedSubmissionRabbitMQConsumer(
    private val updateSubmissionUseCase: UpdateSubmissionUseCase,
) : RabbitMQConsumer<SubmissionMessagePayload>() {
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
