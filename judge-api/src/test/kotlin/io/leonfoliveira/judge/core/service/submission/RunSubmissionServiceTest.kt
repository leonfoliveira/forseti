package io.leonfoliveira.judge.core.service.submission

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.event.SubmissionEvent
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

    context("rerun") {
        val id = UUID.randomUUID()

        test("should throw NotFoundException when submission is not found") {
            every { submissionRepository.findById(id) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.rerun(id)
            }
        }

        test("should throw ForbiddenException when submission is already being judged") {
            val submission =
                SubmissionMockFactory.build(
                    status = Submission.Status.JUDGING,
                )
            every { submissionRepository.findById(id) }
                .returns(Optional.of(submission))

            shouldThrow<ForbiddenException> {
                sut.rerun(id)
            }
        }

        test("should update submission status to JUDGING and emit events") {
            val submission =
                SubmissionMockFactory.build(
                    status = Submission.Status.JUDGED,
                )
            every { submissionRepository.findById(id) }
                .returns(Optional.of(submission))
            every { submissionRepository.save(submission) }
                .returns(submission)
            val eventSlot = slot<SubmissionEvent>()
            every { transactionalEventPublisher.publish(capture(eventSlot)) }
                .returns(Unit)

            val result = sut.rerun(id)

            result.status shouldBe Submission.Status.JUDGING
            result.answer shouldBe Submission.Answer.NO_ANSWER
            eventSlot.captured.submission shouldBe submission
        }
    }

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
                    status = Submission.Status.JUDGED,
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
                .returns(Submission.Answer.ACCEPTED)
            every { submissionRepository.save(submission) }
                .returns(submission)
            val eventSlot = slot<SubmissionEvent>()
            every { transactionalEventPublisher.publish(capture(eventSlot)) }
                .returns(Unit)

            val result = sut.run(id)

            result.status shouldBe Submission.Status.JUDGED
            result.answer shouldBe Submission.Answer.ACCEPTED
            eventSlot.captured.submission shouldBe submission
        }
    }
})
