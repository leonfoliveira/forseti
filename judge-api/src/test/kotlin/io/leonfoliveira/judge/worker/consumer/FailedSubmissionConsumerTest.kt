package io.leonfoliveira.judge.worker.consumer

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.service.submission.UpdateSubmissionService
import io.leonfoliveira.judge.worker.message.SubmissionMessageMockFactory
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class FailedSubmissionConsumerTest : FunSpec({
    val updateSubmissionService = mockk<UpdateSubmissionService>(relaxed = true)

    val sut = FailedSubmissionConsumer(updateSubmissionService)

    test("should call updateSubmissionService.fail with the correct id") {
        val message = SubmissionMessageMockFactory.build()
        every { updateSubmissionService.fail(message.id) } returns SubmissionMockFactory.build()

        sut.receiveMessage(message, mapOf())

        verify { updateSubmissionService.fail(message.id) }
    }
})
