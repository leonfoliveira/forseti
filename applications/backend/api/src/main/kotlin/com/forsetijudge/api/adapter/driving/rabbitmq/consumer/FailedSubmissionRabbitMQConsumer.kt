package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.forsetijudge.core.port.driving.usecase.external.submission.FailSubmissionUseCase
import com.forsetijudge.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.SubmissionQueueMessageBody
import org.springframework.amqp.core.Message
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class FailedSubmissionRabbitMQConsumer(
    private val failSubmissionUseCase: FailSubmissionUseCase,
) : RabbitMQConsumer<SubmissionQueueMessageBody>() {
    @RabbitListener(queues = ["\${spring.rabbitmq.queue.submission-failed-queue}"])
    override fun receiveMessage(message: Message) {
        super.receiveMessage(message)
    }

    override fun getBodyType(): Class<SubmissionQueueMessageBody> = SubmissionQueueMessageBody::class.java

    override fun handleBody(body: SubmissionQueueMessageBody) {
        failSubmissionUseCase.execute(
            FailSubmissionUseCase.Command(submissionId = body.submissionId),
        )
    }
}
