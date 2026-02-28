package com.forsetijudge.autojudge.adapter.driving.consumer

import com.forsetijudge.core.port.driving.usecase.external.submission.AutoJudgeSubmissionUseCase
import com.forsetijudge.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.SubmissionQueueMessageBody
import org.springframework.amqp.core.Message
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class SubmissionQueueRabbitMQConsumer(
    private val autoJudgeSubmissionUseCase: AutoJudgeSubmissionUseCase,
) : RabbitMQConsumer<SubmissionQueueMessageBody>() {
    @RabbitListener(
        queues = ["\${spring.rabbitmq.queue.submission-queue}"],
        concurrency = "\${submission.max-concurrent}",
    )
    override fun receiveMessage(message: Message) {
        super.receiveMessage(message)
    }

    override fun getBodyType(): Class<SubmissionQueueMessageBody> = SubmissionQueueMessageBody::class.java

    override fun handleBody(body: SubmissionQueueMessageBody) {
        autoJudgeSubmissionUseCase.execute(
            AutoJudgeSubmissionUseCase.Command(
                submissionId = body.submissionId,
            ),
        )
    }
}
