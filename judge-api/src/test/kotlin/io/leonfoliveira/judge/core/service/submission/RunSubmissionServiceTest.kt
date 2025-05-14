package io.leonfoliveira.judge.core.service.submission

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import io.leonfoliveira.judge.core.port.SubmissionRunnerAdapter
import io.leonfoliveira.judge.core.repository.SubmissionRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.util.Optional

class RunSubmissionServiceTest : FunSpec({
    val submissionRepository = mockk<SubmissionRepository>()
    val submissionRunnerAdapter = mockk<SubmissionRunnerAdapter>()
    val submissionEmitterAdapter = mockk<SubmissionEmitterAdapter>()

    val sut =
        RunSubmissionService(
            submissionRepository,
            submissionRunnerAdapter,
            submissionEmitterAdapter,
        )

    context("run") {
        test("should throw NotFoundException when submission is not found") {
            every { submissionRepository.findById(1) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.run(1)
            }
        }

        test("should throw BusinessException when submission is not in a runnable state") {
            val submission =
                SubmissionMockFactory.build(
                    status = Submission.Status.ACCEPTED,
                )
            every { submissionRepository.findById(1) }
                .returns(Optional.of(submission))

            shouldThrow<BusinessException> {
                sut.run(1)
            }
        }

        test("should run submission and emit result") {
            val submission =
                SubmissionMockFactory.build(
                    status = Submission.Status.JUDGING,
                )
            every { submissionRepository.findById(1) }
                .returns(Optional.of(submission))
            every { submissionRunnerAdapter.run(submission) }
                .returns(Submission.Status.ACCEPTED)
            every { submissionRepository.save(submission) }
                .returns(submission)
            every { submissionEmitterAdapter.emit(submission) }
                .returns(Unit)

            val result = sut.run(1)

            result.status shouldBe Submission.Status.ACCEPTED
            verify { submissionEmitterAdapter.emit(result) }
        }
    }
})
