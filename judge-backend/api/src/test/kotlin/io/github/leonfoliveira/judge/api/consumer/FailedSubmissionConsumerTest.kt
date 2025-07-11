package io.github.leonfoliveira.judge.api.consumer

import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsMessage
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsSubmissionPayload
import io.github.leonfoliveira.judge.common.service.submission.UpdateSubmissionService
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import java.util.UUID

class FailedSubmissionConsumerTest : FunSpec({
    val updateSubmissionService = mockk<UpdateSubmissionService>(relaxed = true)

    val sut = FailedSubmissionConsumer(updateSubmissionService)

    beforeEach {
        clearAllMocks()
    }

    test("should call updateSubmissionService.fail with the correct submissionId") {
        val submissionId = UUID.randomUUID()
        val message = SqsMessage(
            payload = SqsSubmissionPayload(submissionId),
        )

        sut.receiveMessage(message)

        verify { updateSubmissionService.fail(submissionId) }
    }
})
