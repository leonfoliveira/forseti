package io.github.leonfoliveira.judge.autojudge.consumer

import io.github.leonfoliveira.judge.autojudge.feign.ApiClient
import io.github.leonfoliveira.judge.autojudge.service.RunSubmissionService
import io.github.leonfoliveira.judge.autojudge.util.AutoJudgeMetrics
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.RabbitMQConsumer
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.message.RabbitMQMessage
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.message.SubmissionQueuePayload
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tags
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component
import java.util.function.Supplier

@Component
class SubmissionQueueRabbitMQConsumer(
    private val findSubmissionService: FindSubmissionService,
    private val runSubmissionService: RunSubmissionService,
    private val apiClient: ApiClient,
    private val meterRegistry: MeterRegistry,
) : RabbitMQConsumer<SubmissionQueuePayload>() {
    @RabbitListener(
        queues = ["\${spring.rabbitmq.queue.submission-queue}"],
        concurrency = "\${submission.max-concurrent}",
    )
    override fun receiveMessage(jsonMessage: String) {
        super.receiveMessage(jsonMessage)
    }

    override fun getPayloadType(): Class<SubmissionQueuePayload> = SubmissionQueuePayload::class.java

    override fun handlePayload(payload: SubmissionQueuePayload) {
        meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_RECEIVED_SUBMISSION).increment()

        try {
            val submission = findSubmissionService.findById(payload.submissionId)

            val answer =
                meterRegistry.timer(AutoJudgeMetrics.AUTO_JUDGE_SUBMISSION_RUN_TIME).record(
                    Supplier {
                        runSubmissionService.run(submission)
                    },
                )

            apiClient.updateSubmissionAnswer(payload.contestId, payload.submissionId, answer!!)
            meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_SUCCESSFUL_SUBMISSION, Tags.of("answer", answer.toString())).increment()
        } catch (ex: Exception) {
            meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_FAILED_SUBMISSION).increment()
            throw ex
        }
    }
}
