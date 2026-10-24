package com.forsetijudge.core.infrastructure.sqs

import com.forsetijudge.core.infrastructure.sqs.adapter.SQSProducer
import com.forsetijudge.core.port.output.queue.SubmissionQueueProducer
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.sqs.SqsClient
import tools.jackson.databind.ObjectMapper

@Component
class SubmissionQueueSQSProducer(
    sqsClient: SqsClient,
    objectMapper: ObjectMapper,
    @Value($$"${aws.sqs.submission-queue-url}")
    private val queueUrl: String,
) : SubmissionQueueProducer {
    private val sqsProducer = SQSProducer(sqsClient, objectMapper, queueUrl)

    override fun produce(message: SubmissionQueueProducer.Message) {
        sqsProducer.produce(message)
    }
}
