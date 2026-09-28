package com.forsetijudge.core.infrastructure.sqs

import com.forsetijudge.core.port.output.queue.SubmissionQueueProducer
import com.forsetijudge.core.util.SafeLogger
import io.awspring.cloud.sqs.operations.SqsTemplate
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class SubmissionQueueSQSProducer(
    private val sqsTemplate: SqsTemplate,
    @Value($$"${spring.cloud.aws.sqs.submission-queue}")
    private val queueName: String,
) : SubmissionQueueProducer {
    private val logger = SafeLogger(this::class)

    override fun produce(message: SubmissionQueueProducer.Message) {
        logger.info("Producing message to SQS queue: $queueName, message: $message")

        sqsTemplate.send(queueName, message)
    }
}
