package io.github.leonfoliveira.judge.autojudge.consumer

import io.github.leonfoliveira.judge.autojudge.event.SubmissionJudgedEvent
import io.github.leonfoliveira.judge.autojudge.service.RunSubmissionService
import io.github.leonfoliveira.judge.autojudge.util.AutoJudgeMetrics
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.RabbitMQConsumer
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.message.SubmissionMessagePayload
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tags
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import java.util.function.Supplier

@Component
class SubmissionQueueRabbitMQConsumer(
    private val findSubmissionService: FindSubmissionService,
    private val runSubmissionService: RunSubmissionService,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val meterRegistry: MeterRegistry,
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
        meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_RECEIVED_SUBMISSION).increment()

        try {
            val submission = findSubmissionService.findById(payload.submissionId)

            val answer =
                meterRegistry.timer(AutoJudgeMetrics.AUTO_JUDGE_SUBMISSION_RUN_TIME).record(
                    Supplier {
                        runSubmissionService.run(submission)
                    },
                )!!

            applicationEventPublisher.publishEvent(SubmissionJudgedEvent(this, submission, answer))
            meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_SUCCESSFUL_SUBMISSION, Tags.of("answer", answer.toString())).increment()
        } catch (ex: Exception) {
            meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_FAILED_SUBMISSION).increment()
            throw ex
        }
    }
}
