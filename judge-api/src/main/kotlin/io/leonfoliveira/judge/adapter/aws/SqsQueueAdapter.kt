package io.leonfoliveira.judge.adapter.aws

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.port.SubmissionQueueAdapter
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.services.sqs.SqsClient
import software.amazon.awssdk.services.sqs.model.SendMessageRequest

@Service
class SqsQueueAdapter(
    private val sqsClient: SqsClient,
    @Value("\${spring.cloud.aws.sqs.submission-queue}")
    private val submissionQueue: String,
) : SubmissionQueueAdapter {
    override fun enqueue(submission: Submission) {
        val request =
            SendMessageRequest
                .builder()
                .queueUrl(submissionQueue)
                .messageBody(submission.id.toString())
                .build()
        sqsClient.sendMessage(request)
    }
}
