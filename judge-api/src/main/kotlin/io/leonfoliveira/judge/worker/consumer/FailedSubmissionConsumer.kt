package io.leonfoliveira.judge.worker.consumer

import io.awspring.cloud.sqs.annotation.SqsListener
import io.leonfoliveira.judge.core.service.submission.UpdateSubmissionService
import io.leonfoliveira.judge.worker.consumer.message.SubmissionMessage
import org.springframework.messaging.handler.annotation.Headers
import org.springframework.stereotype.Component

@Component
class FailedSubmissionConsumer(
    private val updateSubmissionService: UpdateSubmissionService,
) : SqsConsumer<SubmissionMessage>() {
    @SqsListener("\${spring.cloud.aws.sqs.submission-dlq}")
    override fun receiveMessage(
        message: SubmissionMessage,
        @Headers headers: Map<String, Any>,
    ) {
        super.receiveMessage(message, headers)
    }

    override fun handleMessage(message: SubmissionMessage) {
        updateSubmissionService.fail(message.id)
    }
}
