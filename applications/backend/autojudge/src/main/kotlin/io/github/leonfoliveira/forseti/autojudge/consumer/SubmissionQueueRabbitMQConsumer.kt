package io.github.leonfoliveira.forseti.autojudge.consumer

import io.github.leonfoliveira.forseti.autojudge.adapter.feign.ApiClient
import io.github.leonfoliveira.forseti.autojudge.service.RunSubmissionService
import io.github.leonfoliveira.forseti.autojudge.util.AutoJudgeMetrics
import io.github.leonfoliveira.forseti.common.adapter.rabbitmq.RabbitMQConsumer
import io.github.leonfoliveira.forseti.common.adapter.rabbitmq.message.SubmissionMessagePayload
import io.github.leonfoliveira.forseti.common.service.submission.FindSubmissionService
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tags
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component
import java.util.function.Supplier

@Component
class SubmissionQueueRabbitMQConsumer(
    private val findSubmissionService: FindSubmissionService,
    private val runSubmissionService: RunSubmissionService,
    private val apiClient: ApiClient,
    private val meterRegistry: MeterRegistry,
) : RabbitMQConsumer<SubmissionMessagePayload>() {
    private val logger = LoggerFactory.getLogger(SubmissionQueueRabbitMQConsumer::class.java)

    @RabbitListener(
        queues = ["\${spring.rabbitmq.queue.submission-queue}"],
        concurrency = "\${submission.max-concurrent}",
    )
    @Transactional
    override fun receiveMessage(jsonMessage: String) {
        try {
            super.receiveMessage(jsonMessage)
        } catch (ex: Exception) {
            // Log the exception and let Spring AMQP handle the retry/rejection
            logger.error("Exception in message processing, will be retried: {}", ex.message, ex)
            throw ex
        }
    }

    override fun getPayloadType(): Class<SubmissionMessagePayload> = SubmissionMessagePayload::class.java

    override fun handlePayload(payload: SubmissionMessagePayload) {
        meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_RECEIVED_SUBMISSION).increment()

        try {
            val submission = findSubmissionService.findById(payload.submissionId)

            val answer =
                meterRegistry.timer(AutoJudgeMetrics.AUTO_JUDGE_SUBMISSION_RUN_TIME).record(
                    Supplier {
                        runSubmissionService.run(submission)
                    },
                )!!

            apiClient.updateSubmissionAnswer(payload.contestId, payload.submissionId, answer)
            meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_SUCCESSFUL_SUBMISSION, Tags.of("answer", answer.toString())).increment()
        } catch (ex: Exception) {
            meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_FAILED_SUBMISSION).increment()
            throw ex
        }
    }
}
