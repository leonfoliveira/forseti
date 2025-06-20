package io.github.leonfoliveira.judge.common.adapter.aws

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsMessage
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsSubmissionPayload
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.port.SubmissionQueueAdapter
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.services.sqs.SqsClient
import software.amazon.awssdk.services.sqs.model.MessageAttributeValue
import software.amazon.awssdk.services.sqs.model.SendMessageRequest

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

    override fun enqueue(submission: Submission) {
        logger.info("Enqueuing submission with id: ${submission.id}")

        val message =
            SqsMessage(
                payload =
                    SqsSubmissionPayload(
                        submissionId = submission.id,
                    ),
            )

        val request =
            SendMessageRequest
                .builder()
                .queueUrl(submissionQueue)
                .messageBody(objectMapper.writeValueAsString(message))
                .delaySeconds(QUEUE_DELAY)
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

        logger.info("Submission with id: ${submission.id} enqueued successfully")
    }
}
