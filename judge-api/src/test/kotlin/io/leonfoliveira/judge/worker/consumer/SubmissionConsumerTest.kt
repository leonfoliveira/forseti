package io.leonfoliveira.judge.worker.consumer

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.service.submission.RunSubmissionService
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.util.UUID

class SubmissionConsumerTest : FunSpec({
    val runSubmissionService = mockk<RunSubmissionService>()

    val sut = SubmissionConsumer(runSubmissionService)

    test("should call runSubmissionService with the correct id") {
        val id = UUID.randomUUID()
        every { runSubmissionService.run(id) }
            .returns(SubmissionMockFactory.build())

        sut.receiveMessage(id, mapOf())

        verify { runSubmissionService.run(id) }
    }
})
