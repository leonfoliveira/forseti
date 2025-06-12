package io.github.leonfoliveira.judge.worker.consumer

import io.awspring.cloud.sqs.annotation.SqsListener
import io.github.leonfoliveira.judge.adapter.aws.message.SqsMessage
import io.github.leonfoliveira.judge.adapter.aws.message.SqsSubmissionPayload
import io.github.leonfoliveira.judge.worker.feign.ApiClient
import org.springframework.stereotype.Component

@Component
class FailedSubmissionConsumer(
    private val apiClient: ApiClient,
) : SqsConsumer<SqsSubmissionPayload>() {
    @SqsListener("\${spring.cloud.aws.sqs.submission-failed-queue}")
    override fun receiveMessage(message: SqsMessage<SqsSubmissionPayload>) {
        super.receiveMessage(message)
    }

    override fun handlePayload(payload: SqsSubmissionPayload) {
        apiClient.failSubmission(payload.submissionId)
    }
}
