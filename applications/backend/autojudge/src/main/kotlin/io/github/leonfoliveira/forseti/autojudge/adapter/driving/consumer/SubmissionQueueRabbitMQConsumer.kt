package io.github.leonfoliveira.forseti.autojudge.adapter.driving.consumer

import io.github.leonfoliveira.forseti.autojudge.application.port.driving.JudgeSubmissionUseCase
import io.github.leonfoliveira.forseti.common.adapter.driven.rabbitmq.RabbitMQConsumer
import io.github.leonfoliveira.forseti.common.adapter.driven.rabbitmq.message.SubmissionMessagePayload
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class SubmissionQueueRabbitMQConsumer(
    private val judgeSubmissionUseCase: JudgeSubmissionUseCase,
) : RabbitMQConsumer<SubmissionMessagePayload>() {
    @RabbitListener(
        queues = ["\${spring.rabbitmq.queue.submission-queue}"],
        concurrency = "\${submission.max-concurrent}",
    )
    override fun receiveMessage(jsonMessage: String) {
        super.receiveMessage(jsonMessage)
    }

    override fun getPayloadType(): Class<SubmissionMessagePayload> = SubmissionMessagePayload::class.java

    /**
     * Handles a submission enqueued for judging
     *
     * @param payload The submission message payload
     */
    override fun handlePayload(payload: SubmissionMessagePayload) {
        judgeSubmissionUseCase.judge(payload.contestId, payload.submissionId)
    }
}
