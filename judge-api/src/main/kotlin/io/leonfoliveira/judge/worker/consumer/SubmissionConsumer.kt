package io.leonfoliveira.judge.worker.consumer

import io.awspring.cloud.sqs.annotation.SqsListener
import io.leonfoliveira.judge.core.exception.BusinessException
import io.leonfoliveira.judge.core.service.submission.RunSubmissionService
import jakarta.transaction.Transactional
import org.springframework.stereotype.Component

@Component
class SubmissionConsumer(
    private val runSubmissionService: RunSubmissionService,
) {
    @SqsListener("\${spring.cloud.aws.sqs.submission-queue}")
    @Transactional
    fun receiveMessage(message: String) {
        val id =
            message.toIntOrNull()
                ?: throw BusinessException("Invalid message format: $message")
        runSubmissionService.run(id)
    }
}
