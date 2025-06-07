package io.leonfoliveira.judge.core.service.submission

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.event.SubmissionStatusUpdatedEvent
import io.leonfoliveira.judge.core.port.SubmissionRunnerAdapter
import io.leonfoliveira.judge.core.repository.SubmissionRepository
import io.leonfoliveira.judge.core.util.TransactionalEventPublisher
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import java.util.Optional
import java.util.UUID

class RunSubmissionServiceTest : FunSpec({
    val submissionRepository = mockk<SubmissionRepository>()
    val submissionRunnerAdapter = mockk<SubmissionRunnerAdapter>()
    val transactionalEventPublisher = mockk<TransactionalEventPublisher>(relaxed = true)

    val sut =
        RunSubmissionService(
            submissionRepository,
            submissionRunnerAdapter,
            transactionalEventPublisher,
        )

    context("run") {
        val id = UUID.randomUUID()

        test("should throw NotFoundException when submission is not found") {
            every { submissionRepository.findById(id) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.run(id)
            }
        }

        test("should throw ForbiddenException when submission is not in a runnable state") {
            val submission =
                SubmissionMockFactory.build(
                    status = Submission.Status.ACCEPTED,
                )
            every { submissionRepository.findById(id) }
                .returns(Optional.of(submission))

            shouldThrow<ForbiddenException> {
                sut.run(id)
            }
        }

        test("should run submission and emit result") {
            val submission =
                SubmissionMockFactory.build(
                    status = Submission.Status.JUDGING,
                )
            every { submissionRepository.findById(id) }
                .returns(Optional.of(submission))
            every { submissionRunnerAdapter.run(submission) }
                .returns(Submission.Status.ACCEPTED)
            every { submissionRepository.save(submission) }
                .returns(submission)
            val eventSlot = slot<SubmissionStatusUpdatedEvent>()
            every { transactionalEventPublisher.publish(capture(eventSlot)) }
                .returns(Unit)

            val result = sut.run(id)

            result.status shouldBe Submission.Status.ACCEPTED
            eventSlot.captured.submission shouldBe submission
        }
    }
})
