package io.github.leonfoliveira.judge.api.consumer

import io.awspring.cloud.sqs.annotation.SqsListener
import io.github.leonfoliveira.judge.common.adapter.aws.SqsConsumer
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsMessage
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsSubmissionPayload
import io.github.leonfoliveira.judge.common.service.submission.UpdateSubmissionService
import org.springframework.stereotype.Component

@Component
class FailedSubmissionConsumer(
    private val updateSubmissionService: UpdateSubmissionService,
) : SqsConsumer<SqsSubmissionPayload>() {
    @SqsListener("\${spring.cloud.aws.sqs.submission-failed-queue}")
    override fun receiveMessage(message: SqsMessage<SqsSubmissionPayload>) {
        super.receiveMessage(message)
    }

    override fun handlePayload(payload: SqsSubmissionPayload) {
        updateSubmissionService.fail(payload.submissionId)
    }
}
