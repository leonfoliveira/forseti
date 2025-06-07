package io.leonfoliveira.judge.worker.consumer

import io.awspring.cloud.sqs.annotation.SqsListener
import io.leonfoliveira.judge.core.service.submission.UpdateSubmissionService
import org.springframework.messaging.handler.annotation.Headers
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class FailedSubmissionConsumer(
    private val updateSubmissionService: UpdateSubmissionService,
) : SqsConsumer<UUID>() {
    @SqsListener("\${spring.cloud.aws.sqs.submission-dlq}")
    override fun receiveMessage(
        message: UUID,
        @Headers headers: Map<String, Any>,
    ) {
        super.receiveMessage(message, headers)
    }

    override fun handleMessage(message: UUID) {
        updateSubmissionService.fail(message)
    }
}
