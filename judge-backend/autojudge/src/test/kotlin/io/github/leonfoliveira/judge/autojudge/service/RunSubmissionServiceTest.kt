package io.github.leonfoliveira.judge.autojudge.service

import io.github.leonfoliveira.judge.autojudge.docker.DockerSubmissionRunnerAdapter
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.mock.entity.ExecutionMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk

class RunSubmissionServiceTest : FunSpec({
    val dockerSubmissionRunnerAdapter = mockk<DockerSubmissionRunnerAdapter>(relaxed = true)

    val sut =
        RunSubmissionService(
            dockerSubmissionRunnerAdapter = dockerSubmissionRunnerAdapter,
        )

    beforeEach {
        clearAllMocks()
    }

    context("run") {
        test("should run submission and return answer") {
            val submission = SubmissionMockBuilder.build()
            val expectedAnswer = Submission.Answer.ACCEPTED
            every { dockerSubmissionRunnerAdapter.run(submission) } returns ExecutionMockBuilder.build(answer = expectedAnswer)

            val actualAnswer = sut.run(submission)

            actualAnswer shouldBe expectedAnswer
        }
    }
})
