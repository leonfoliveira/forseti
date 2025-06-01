package io.leonfoliveira.judge.core.service.submission

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.event.SubmissionUpdatedEvent
import io.leonfoliveira.judge.core.port.SubmissionRunnerAdapter
import io.leonfoliveira.judge.core.repository.SubmissionRepository
import io.leonfoliveira.judge.core.util.TransactionalEventPublisher
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import java.util.Optional

class RunSubmissionServiceTest : FunSpec({
    val submissionRepository = mockk<SubmissionRepository>()
    val submissionRunnerAdapter = mockk<SubmissionRunnerAdapter>()
    val transactionalEventPublisher = mockk<TransactionalEventPublisher>()

    val sut =
        RunSubmissionService(
            submissionRepository,
            submissionRunnerAdapter,
            transactionalEventPublisher,
        )

    context("run") {
        test("should throw NotFoundException when submission is not found") {
            every { submissionRepository.findById(1) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.run(1)
            }
        }

        test("should throw ForbiddenException when submission is not in a runnable state") {
            val submission =
                SubmissionMockFactory.build(
                    status = Submission.Status.ACCEPTED,
                )
            every { submissionRepository.findById(1) }
                .returns(Optional.of(submission))

            shouldThrow<ForbiddenException> {
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
            val eventSlot = slot<SubmissionUpdatedEvent>()
            every { transactionalEventPublisher.publish(capture(eventSlot)) }
                .returns(Unit)

            val result = sut.run(1)

            result.status shouldBe Submission.Status.ACCEPTED
            eventSlot.captured.submission shouldBe submission
        }
    }
})
