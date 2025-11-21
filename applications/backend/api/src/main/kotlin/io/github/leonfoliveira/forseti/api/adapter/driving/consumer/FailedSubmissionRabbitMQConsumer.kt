package io.github.leonfoliveira.forseti.api.adapter.driving.consumer

import live.forseti.core.port.driving.usecase.submission.UpdateSubmissionUseCase
import live.forseti.infrastruture.adapter.rabbitmq.RabbitMQConsumer
import live.forseti.infrastruture.adapter.rabbitmq.payload.SubmissionMessagePayload
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
