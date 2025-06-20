package io.github.leonfoliveira.judge.worker.consumer

import io.awspring.cloud.sqs.annotation.SqsListener
import io.github.leonfoliveira.judge.adapter.aws.message.SqsMessage
import io.github.leonfoliveira.judge.adapter.aws.message.SqsSubmissionPayload
import io.github.leonfoliveira.judge.core.service.submission.RunSubmissionService
import io.github.leonfoliveira.judge.worker.feign.ApiClient
import org.springframework.stereotype.Component

@Component
class SubmissionConsumer(
    private val runSubmissionService: RunSubmissionService,
    private val apiClient: ApiClient,
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
        val answer = runSubmissionService.run(payload.submissionId)
        apiClient.updateSubmissionAnswer(payload.submissionId, answer)
    }
}
