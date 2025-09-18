package io.github.leonfoliveira.judge.api.consumer

import io.github.leonfoliveira.judge.common.adapter.rabbitmq.RabbitMQConsumer
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.message.RabbitMQMessage
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.message.SubmissionQueuePayload
import io.github.leonfoliveira.judge.common.service.submission.UpdateSubmissionService
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class FailedSubmissionRabbitMQConsumer(
    private val updateSubmissionService: UpdateSubmissionService,
) : RabbitMQConsumer<SubmissionQueuePayload>() {
    @RabbitListener(queues = ["\${spring.rabbitmq.queue.submission-failed-queue}"])
    override fun receiveMessage(jsonMessage: String) {
        super.receiveMessage(jsonMessage)
    }

    override fun getPayloadType(): Class<SubmissionQueuePayload> = SubmissionQueuePayload::class.java

    override fun handlePayload(payload: SubmissionQueuePayload) {
        updateSubmissionService.fail(payload.submissionId)
    }
}
