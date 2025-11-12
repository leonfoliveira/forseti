package io.github.leonfoliveira.forseti.autojudge.consumer

import io.github.leonfoliveira.forseti.autojudge.service.JudgeSubmissionService
import io.github.leonfoliveira.forseti.autojudge.util.AutoJudgeMetrics
import io.github.leonfoliveira.forseti.common.adapter.rabbitmq.RabbitMQConsumer
import io.github.leonfoliveira.forseti.common.adapter.rabbitmq.message.SubmissionMessagePayload
import io.micrometer.core.instrument.Tags
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class SubmissionQueueRabbitMQConsumer(
    private val judgeSubmissionService: JudgeSubmissionService,
) : RabbitMQConsumer<SubmissionMessagePayload>() {
    @RabbitListener(
        queues = ["\${spring.rabbitmq.queue.submission-queue}"],
        concurrency = "\${submission.max-concurrent}",
    )
    override fun receiveMessage(jsonMessage: String) {
        super.receiveMessage(jsonMessage)
    }

    override fun getPayloadType(): Class<SubmissionMessagePayload> = SubmissionMessagePayload::class.java

    override fun handlePayload(payload: SubmissionMessagePayload) {
        judgeSubmissionService.judge(payload.contestId, payload.submissionId)
    }
}
