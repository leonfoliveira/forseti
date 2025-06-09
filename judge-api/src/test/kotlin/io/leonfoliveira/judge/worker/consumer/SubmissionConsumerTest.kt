package io.leonfoliveira.judge.worker.consumer

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.service.submission.RunSubmissionService
import io.leonfoliveira.judge.worker.message.SubmissionMessageMockFactory
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class SubmissionConsumerTest : FunSpec({
    val runSubmissionService = mockk<RunSubmissionService>()

    val sut = SubmissionConsumer(runSubmissionService)

    test("should call runSubmissionService with the correct id") {
        val message = SubmissionMessageMockFactory.build()
        every { runSubmissionService.run(message.id) }
            .returns(SubmissionMockFactory.build())

        sut.receiveMessage(message, mapOf())

        verify { runSubmissionService.run(message.id) }
    }
})
