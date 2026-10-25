package com.forsetijudge.core.infrastructure.sqs.adapter

import com.forsetijudge.core.util.SafeLogger
import software.amazon.awssdk.services.sqs.SqsClient
import software.amazon.awssdk.services.sqs.model.MessageAttributeValue
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
        logger.info("Producing message to SQS url: $queueUrl")

        val traceAttributes =
            SQSTraceContext
                .inject()
                .mapValues { (_, value) ->
                    MessageAttributeValue
                        .builder()
                        .dataType("String")
                        .stringValue(value)
                        .build()
                }

        val request =
            SendMessageRequest
                .builder()
                .queueUrl(queueUrl)
                .messageBody(objectMapper.writeValueAsString(message))
                .messageAttributes(traceAttributes)
                .build()

        sqsClient.sendMessage(request)
    }
}
