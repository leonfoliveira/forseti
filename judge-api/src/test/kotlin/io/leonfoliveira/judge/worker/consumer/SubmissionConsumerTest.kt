package io.leonfoliveira.judge.worker.consumer

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import io.leonfoliveira.judge.core.service.submission.RunSubmissionService
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class SubmissionConsumerTest : FunSpec({
    val runSubmissionService = mockk<RunSubmissionService>()

    val sut = SubmissionConsumer(runSubmissionService)

    test("should call runSubmissionService with the correct id") {
        val id = 1
        every { runSubmissionService.run(id) }
            .returns(SubmissionMockFactory.build())

        sut.receiveMessage(id.toString())

        verify { runSubmissionService.run(id) }
    }

    test("should throw BusinessException when id is not a number") {
        shouldThrow<BusinessException> {
            sut.receiveMessage("not-a-number")
        }
    }
})
