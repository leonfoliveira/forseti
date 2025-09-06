package io.github.leonfoliveira.judge.autojudge.consumer

import io.awspring.cloud.sqs.annotation.SqsListener
import io.github.leonfoliveira.judge.autojudge.feign.ApiClient
import io.github.leonfoliveira.judge.autojudge.service.RunSubmissionService
import io.github.leonfoliveira.judge.autojudge.util.AutoJudgeMetrics
import io.github.leonfoliveira.judge.common.adapter.aws.SqsConsumer
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsMessage
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsSubmissionPayload
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tags
import org.springframework.stereotype.Component
import java.util.function.Supplier

@Component
class SubmissionConsumer(
    private val findSubmissionService: FindSubmissionService,
    private val runSubmissionService: RunSubmissionService,
    private val apiClient: ApiClient,
    private val meterRegistry: MeterRegistry,
) : SqsConsumer<SqsSubmissionPayload>() {
    @SqsListener(
        "\${spring.cloud.aws.sqs.submission-queue}",
        maxConcurrentMessages = "\${submission.max-concurrent}",
        maxMessagesPerPoll = "\${submission.max-concurrent}",
    )
    override fun receiveMessage(message: SqsMessage<SqsSubmissionPayload>) {
        super.receiveMessage(message)
    }

    override fun handlePayload(payload: SqsSubmissionPayload) {
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
