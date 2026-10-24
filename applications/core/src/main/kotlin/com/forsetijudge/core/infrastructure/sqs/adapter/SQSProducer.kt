package com.forsetijudge.core.infrastructure.sqs.adapter

import com.forsetijudge.core.util.SafeLogger
import software.amazon.awssdk.services.sqs.SqsClient
import software.amazon.awssdk.services.sqs.model.SendMessageRequest
import tools.jackson.databind.ObjectMapper

class SQSProducer(
    private val sqsClient: SqsClient,
    private val objectMapper: ObjectMapper,
    private val queueUrl: String,
) {
    val logger = SafeLogger(this::class)

    /**
     * Produces a message to the SQS queue.
     *
     * @param message The message to be sent to the SQS queue.
     */
    fun produce(message: Any) {
        logger.info("Producing message to SQS url: $queueUrl, message: $message")

        sqsClient.sendMessage(
            SendMessageRequest
                .builder()
                .queueUrl(queueUrl)
                .messageBody(objectMapper.writeValueAsString(message))
                .build(),
        )
    }
}
