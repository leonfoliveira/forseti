package io.leonfoliveira.judge.worker.consumer

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import io.leonfoliveira.judge.core.service.submission.UpdateSubmissionService
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class FailedSubmissionConsumerTest : FunSpec({
    val updateSubmissionService = mockk<UpdateSubmissionService>(relaxed = true)

    val sut = FailedSubmissionConsumer(updateSubmissionService)

    test("should call updateSubmissionService.fail with the correct id") {
        val id = 1
        every { updateSubmissionService.fail(id) } returns SubmissionMockFactory.build()

        sut.receiveMessage(id.toString(), mapOf())

        verify { updateSubmissionService.fail(id) }
    }

    test("should throw BusinessException when message is not a valid number") {
        shouldThrow<BusinessException> {
            sut.receiveMessage("not-a-number", mapOf())
        }
    }
})
