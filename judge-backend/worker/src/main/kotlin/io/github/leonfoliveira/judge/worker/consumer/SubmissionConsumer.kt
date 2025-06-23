package io.github.leonfoliveira.judge.worker.consumer

import io.awspring.cloud.sqs.annotation.SqsListener
import io.github.leonfoliveira.judge.common.adapter.aws.SqsConsumer
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsMessage
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsSubmissionPayload
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import io.github.leonfoliveira.judge.worker.feign.ApiClient
import io.github.leonfoliveira.judge.worker.service.RunSubmissionService
import io.github.leonfoliveira.judge.worker.util.WorkerMetrics
import io.micrometer.core.instrument.MeterRegistry
import java.util.function.Supplier
import org.springframework.stereotype.Component

@Component
class SubmissionConsumer(
    private val findSubmissionService: FindSubmissionService,
    private val runSubmissionService: RunSubmissionService,
    private val apiClient: ApiClient,
    private val meterRegistry: MeterRegistry,
) : SqsConsumer<SqsSubmissionPayload>() {
    @SqsListener("\${spring.cloud.aws.sqs.submission-queue}",
        maxConcurrentMessages = "\${submission.max-concurrent}",
        maxMessagesPerPoll = "\${submission.max-concurrent}")
    override fun receiveMessage(message: SqsMessage<SqsSubmissionPayload>) {
        super.receiveMessage(message)
    }

    override fun handlePayload(payload: SqsSubmissionPayload) {
        meterRegistry.counter(WorkerMetrics.WORKER_RECEIVED_SUBMISSION).increment()

        try {
            val submission = findSubmissionService.findById(payload.submissionId)

            val answer = meterRegistry.timer(WorkerMetrics.WORKER_SUBMISSION_RUN_TIME).record(Supplier {
                runSubmissionService.run(submission)
            })

            apiClient.updateSubmissionAnswer(payload.submissionId, answer!!)
            meterRegistry.counter(WorkerMetrics.WORKER_SUCCESSFUL_SUBMISSION).increment()
        } catch (ex: Exception) {
            meterRegistry.counter(WorkerMetrics.WORKER_FAILED_SUBMISSION).increment()
            throw ex;
        }
    }
}