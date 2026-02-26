package com.forsetijudge.autojudge.adapter.driving.consumer

import com.forsetijudge.core.port.driven.queue.payload.SubmissionQueuePayload
import com.forsetijudge.core.port.driving.usecase.external.submission.AutoJudgeSubmissionUseCase
import com.forsetijudge.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class SubmissionQueueRabbitMQConsumer(
    private val autoJudgeSubmissionUseCase: AutoJudgeSubmissionUseCase,
) : RabbitMQConsumer<SubmissionQueuePayload>() {
    @RabbitListener(
        queues = ["\${spring.rabbitmq.queue.submission-queue}"],
        concurrency = "\${submission.max-concurrent}",
    )
    override fun receiveMessage(jsonMessage: String) {
        super.receiveMessage(jsonMessage)
    }

    override fun getPayloadType(): Class<SubmissionQueuePayload> = SubmissionQueuePayload::class.java

    /**
     * Handles a submission enqueued for judging
     *
     * @param payload The submission message payload
     */
    override fun handlePayload(payload: SubmissionQueuePayload) {
        autoJudgeSubmissionUseCase.execute(
            AutoJudgeSubmissionUseCase.Command(
                submissionId = payload.submissionId,
            ),
        )
    }
}
