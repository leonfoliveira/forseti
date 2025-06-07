package io.leonfoliveira.judge.worker.consumer

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.service.submission.UpdateSubmissionService
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.util.UUID

class FailedSubmissionConsumerTest : FunSpec({
    val updateSubmissionService = mockk<UpdateSubmissionService>(relaxed = true)

    val sut = FailedSubmissionConsumer(updateSubmissionService)

    test("should call updateSubmissionService.fail with the correct id") {
        val id = UUID.randomUUID()
        every { updateSubmissionService.fail(id) } returns SubmissionMockFactory.build()

        sut.receiveMessage(id, mapOf())

        verify { updateSubmissionService.fail(id) }
    }
})
