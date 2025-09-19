package io.github.leonfoliveira.judge.api.consumer

import io.github.leonfoliveira.judge.common.adapter.rabbitmq.RabbitMQConsumer
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.message.SubmissionMessagePayload
import io.github.leonfoliveira.judge.common.service.submission.UpdateSubmissionService
import jakarta.transaction.Transactional
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class FailedSubmissionRabbitMQConsumer(
    private val updateSubmissionService: UpdateSubmissionService,
) : RabbitMQConsumer<SubmissionMessagePayload>() {
    @RabbitListener(queues = ["\${spring.rabbitmq.queue.submission-failed-queue}"])
    @Transactional
    override fun receiveMessage(jsonMessage: String) {
        super.receiveMessage(jsonMessage)
    }

    override fun getPayloadType(): Class<SubmissionMessagePayload> = SubmissionMessagePayload::class.java

    override fun handlePayload(payload: SubmissionMessagePayload) {
        updateSubmissionService.fail(payload.submissionId)
    }
}
