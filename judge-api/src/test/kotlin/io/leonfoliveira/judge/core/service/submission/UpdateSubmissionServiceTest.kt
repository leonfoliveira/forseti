package io.leonfoliveira.judge.core.service.submission

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.event.SubmissionStatusUpdatedEvent
import io.leonfoliveira.judge.core.repository.SubmissionRepository
import io.leonfoliveira.judge.core.util.TransactionalEventPublisher
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import java.util.Optional
import java.util.UUID

class UpdateSubmissionServiceTest : FunSpec({
    val submissionRepository = mockk<SubmissionRepository>()
    val transactionalEventPublisher = mockk<TransactionalEventPublisher>(relaxed = true)

    val sut = UpdateSubmissionService(submissionRepository, transactionalEventPublisher)

    context("fail") {
        test("mark submission as failed when it exists") {
            val submissionId = UUID.randomUUID()
            val submission = SubmissionMockFactory.build(id = submissionId)
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)
            every { submissionRepository.save(submission) } returnsArgument 0

            val result = sut.fail(submissionId)

            result.hasFailed shouldBe true
            verify { submissionRepository.save(submission) }
        }

        test("throw NotFoundException when submission does not exist") {
            val submissionId = UUID.randomUUID()
            every { submissionRepository.findById(submissionId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.fail(submissionId)
            }
        }
    }

    context("updateStatus") {
        test("update submission status when it is in JUDGING status") {
            val submissionId = UUID.randomUUID()
            val submission = SubmissionMockFactory.build(id = submissionId, status = Submission.Status.JUDGING, hasFailed = true)
            val newStatus = Submission.Status.ACCEPTED
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)
            every { submissionRepository.save(submission) } returnsArgument 0
            val eventSlot = slot<SubmissionStatusUpdatedEvent>()
            every { transactionalEventPublisher.publish(capture(eventSlot)) }
                .returns(Unit)

            val result = sut.updateStatus(submissionId, newStatus)

            result.status shouldBe newStatus
            verify { submissionRepository.save(submission) }
            verify { transactionalEventPublisher.publish(any<SubmissionStatusUpdatedEvent>()) }
            eventSlot.captured.submission shouldBe submission
        }

        test("throw ForbiddenException when submission is not in JUDGING status") {
            val submissionId = UUID.randomUUID()
            val submission = SubmissionMockFactory.build(id = submissionId, status = Submission.Status.ACCEPTED)
            val newStatus = Submission.Status.WRONG_ANSWER
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)

            shouldThrow<ForbiddenException> {
                sut.updateStatus(submissionId, newStatus)
            }
        }

        test("throw ForbiddenException when submission has not failed") {
            val submissionId = UUID.randomUUID()
            val submission = SubmissionMockFactory.build(id = submissionId, status = Submission.Status.JUDGING, hasFailed = false)
            val newStatus = Submission.Status.ACCEPTED
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)

            shouldThrow<ForbiddenException> {
                sut.updateStatus(submissionId, newStatus)
            }
        }

        test("throw NotFoundException when submission does not exist") {
            val submissionId = UUID.randomUUID()
            val newStatus = Submission.Status.ACCEPTED
            every { submissionRepository.findById(submissionId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.updateStatus(submissionId, newStatus)
            }
        }
    }
})
