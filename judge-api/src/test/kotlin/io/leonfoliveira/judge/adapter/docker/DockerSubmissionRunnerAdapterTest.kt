package io.leonfoliveira.judge.adapter.docker

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import java.io.File
import java.util.concurrent.TimeoutException

class DockerSubmissionRunnerAdapterTest : FunSpec({
    val bucketAdapter = mockk<BucketAdapter>()
    val submission = SubmissionMockFactory.build()
    val container = mockk<DockerContainer>(relaxed = false)

    val sut = DockerSubmissionRunnerAdapter(bucketAdapter)

    beforeEach {
        every { bucketAdapter.download(any()) } returns "1,1\n2,2".toByteArray()
        mockkObject(DockerContainerFactory)
        every { DockerContainerFactory.create(any(), any(), any<File>()) }
            .returns(container)
        every { container.start() } returns Unit
        every { container.kill() } returns Unit
    }

    test("run returns ACCEPTED when all test cases pass") {
        every { container.exec(any(), any(), any()) } returnsMany listOf("1", "2")

        sut.run(submission) shouldBe Submission.Status.ACCEPTED
    }

    test("run returns WRONG_ANSWER when a test case fails") {
        every { container.exec(any(), any(), any()) } returnsMany listOf("1", "3")

        sut.run(submission) shouldBe Submission.Status.WRONG_ANSWER
    }

    test("run returns TIME_LIMIT_EXCEEDED when a test case times out") {
        every { container.exec(any(), any(), any()) } throws TimeoutException()

        sut.run(submission) shouldBe Submission.Status.TIME_LIMIT_EXCEEDED
    }

    // TODO: Update when there is a compiled language
//    test("run returns COMPILATION_ERROR when compilation fails") {
//        every { container.exec(any()) } throws Exception("Compilation failed")
//
//        sut.run(submission) shouldBe Submission.Status.COMPILATION_ERROR
//    }

    test("run returns RUNTIME_ERROR when an unexpected error occurs during execution") {
        every { container.exec(any(), any(), any()) } throws Exception("Unexpected error")

        sut.run(submission) shouldBe Submission.Status.RUNTIME_ERROR
    }
})
