package com.forsetijudge.autojudge.adapter.driving.consumer

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.submission.JudgeSubmissionUseCase
import com.forsetijudge.infrastructure.adapter.driving.consumer.RabbitMQConsumer
import com.forsetijudge.infrastructure.adapter.dto.message.payload.SubmissionMessagePayload
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class SubmissionQueueRabbitMQConsumer(
    private val judgeSubmissionUseCase: JudgeSubmissionUseCase,
) : RabbitMQConsumer<SubmissionMessagePayload>(Member.AUTOJUDGE_ID) {
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
