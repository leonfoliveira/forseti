package io.leonfoliveira.judge.worker.consumer

import io.awspring.cloud.sqs.annotation.SqsListener
import io.leonfoliveira.judge.core.service.submission.RunSubmissionService
import org.springframework.messaging.handler.annotation.Headers
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class SubmissionConsumer(
    private val runSubmissionService: RunSubmissionService,
) : SqsConsumer<UUID>() {
    @SqsListener("\${spring.cloud.aws.sqs.submission-queue}")
    override fun receiveMessage(
        message: UUID,
        @Headers headers: Map<String, Any>,
    ) {
        super.receiveMessage(message, headers)
    }

    override fun handleMessage(message: UUID) {
        runSubmissionService.run(message)
    }
}
