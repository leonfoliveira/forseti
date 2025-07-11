package io.github.leonfoliveira.judge.worker.service

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.worker.docker.DockerSubmissionRunnerAdapter
import io.github.leonfoliveira.judge.worker.feign.ApiClient
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class RunSubmissionServiceTest : FunSpec({
    val dockerSubmissionRunnerAdapter = mockk<DockerSubmissionRunnerAdapter>(relaxed = true)
    val apiClient = mockk<ApiClient>(relaxed = true)

    val sut = RunSubmissionService(
        dockerSubmissionRunnerAdapter = dockerSubmissionRunnerAdapter,
        apiClient = apiClient
    )

    beforeEach {
        clearAllMocks()
    }

    context("run") {
        test("should run submission and return answer") {
            val submission = SubmissionMockBuilder.build()
            val expectedAnswer = Submission.Answer.ACCEPTED
            every { dockerSubmissionRunnerAdapter.run(submission) } returns expectedAnswer

            val actualAnswer = sut.run(submission)

            actualAnswer shouldBe expectedAnswer
            verify { apiClient.updateSubmissionAnswer(submission.id, expectedAnswer) }
        }
    }
})
