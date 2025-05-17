package io.leonfoliveira.judge.worker.consumer

import io.awspring.cloud.sqs.annotation.SqsListener
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import io.leonfoliveira.judge.core.service.submission.RunSubmissionService
import org.springframework.stereotype.Component

@Component
class SubmissionConsumer(
    private val runSubmissionService: RunSubmissionService,
) : SqsConsumer() {
    @SqsListener("\${spring.cloud.aws.sqs.submission-queue}")
    override fun receiveMessage(message: String) {
        super.receiveMessage(message)
    }

    override fun handleMessage(message: String) {
        val id =
            message.toIntOrNull()
                ?: throw BusinessException("Invalid message format: $message")
        runSubmissionService.run(id)
    }
}
