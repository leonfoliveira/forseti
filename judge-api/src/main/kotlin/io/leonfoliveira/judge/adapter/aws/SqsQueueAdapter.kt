package io.leonfoliveira.judge.adapter.aws

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.port.SubmissionQueueAdapter
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.services.sqs.SqsClient
import software.amazon.awssdk.services.sqs.model.MessageAttributeValue
import software.amazon.awssdk.services.sqs.model.SendMessageRequest
import java.util.UUID

@Service
class SqsQueueAdapter(
    private val sqsClient: SqsClient,
    @Value("\${spring.cloud.aws.sqs.submission-queue}")
    private val submissionQueue: String,
) : SubmissionQueueAdapter {
    companion object {
        private const val QUEUE_DELAY = 1
    }

    private val logger = LoggerFactory.getLogger(this::class.java)

    private val objectMapper = jacksonObjectMapper()

    data class SubmissionPayload(
        val id: UUID,
    )

    override fun enqueue(submission: Submission) {
        logger.info("Enqueuing submission with id: ${submission.id}")

        val traceId = MDC.get("traceId")

        val payload = SubmissionPayload(id = submission.id)

        val request =
            SendMessageRequest
                .builder()
                .queueUrl(submissionQueue)
                .messageBody(objectMapper.writeValueAsString(payload))
                .delaySeconds(QUEUE_DELAY)
                .messageAttributes(
                    mapOf(
                        "traceId" to
                            MessageAttributeValue.builder()
                                .dataType("String")
                                .stringValue(traceId)
                                .build(),
                        "contentType" to
                            MessageAttributeValue.builder()
                                .dataType("String")
                                .stringValue("application/json")
                                .build(),
                    ),
                )
                .build()
        sqsClient.sendMessage(request)

        logger.info("Submission with id: ${submission.id} enqueued successfully")
    }
}
