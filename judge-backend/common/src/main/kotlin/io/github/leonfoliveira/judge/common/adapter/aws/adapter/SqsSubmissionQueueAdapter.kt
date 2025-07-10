package io.github.leonfoliveira.judge.common.adapter.aws.adapter

import io.github.leonfoliveira.judge.common.adapter.aws.SqsAdapter
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsSubmissionPayload
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.port.SubmissionQueueAdapter
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class SqsSubmissionQueueAdapter(
    private val sqsAdapter: SqsAdapter,
    @Value("\${spring.cloud.aws.sqs.submission-queue}")
    private val submissionQueue: String,
) : SubmissionQueueAdapter {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun enqueue(submission: Submission) {
        logger.info("Enqueuing submission with id: ${submission.id}")

        sqsAdapter.enqueue(
            queue = submissionQueue,
            payload = SqsSubmissionPayload(
                submissionId = submission.id,
            )
        )

        logger.info("Submission enqueued successfully")
    }
}
