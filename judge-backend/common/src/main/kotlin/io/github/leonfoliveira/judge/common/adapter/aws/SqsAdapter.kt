package io.github.leonfoliveira.judge.common.adapter.aws

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsMessage
import java.io.Serializable
import java.util.UUID
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import software.amazon.awssdk.services.sqs.SqsClient
import software.amazon.awssdk.services.sqs.model.MessageAttributeValue
import software.amazon.awssdk.services.sqs.model.SendMessageRequest

@Service
class SqsAdapter(
    private val sqsClient: SqsClient,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    private val objectMapper = jacksonObjectMapper()

    fun enqueue(queue: String, payload: Serializable) {
        val id = UUID.randomUUID()
        logger.info("Enqueuing message with id: $id")

        val message = SqsMessage(
            id = id,
            payload = payload
        )

        val request =
            SendMessageRequest
                .builder()
                .queueUrl(queue)
                .messageBody(objectMapper.writeValueAsString(message))
                .messageAttributes(
                    mapOf(
                        "contentType" to
                            MessageAttributeValue.builder()
                                .dataType("String")
                                .stringValue("application/json")
                                .build(),
                    ),
                )
                .build()
        sqsClient.sendMessage(request)

        logger.info("Message enqueued successfully")
    }
}
