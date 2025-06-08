package io.leonfoliveira.judge.core.service.submission

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.event.SubmissionEvent
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

            result.status shouldBe Submission.Status.FAILED
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

    context("judge") {
        test("update submission answer") {
            val submissionId = UUID.randomUUID()
            val submission = SubmissionMockFactory.build(id = submissionId, status = Submission.Status.FAILED)
            val answer = Submission.Answer.ACCEPTED
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)
            every { submissionRepository.save(submission) } returnsArgument 0
            val eventSlot = slot<SubmissionEvent>()
            every { transactionalEventPublisher.publish(capture(eventSlot)) }
                .returns(Unit)

            val result = sut.updateAnswer(submissionId, answer)

            result.status shouldBe Submission.Status.JUDGED
            result.answer shouldBe answer
            verify { submissionRepository.save(submission) }
            verify { transactionalEventPublisher.publish(any<SubmissionEvent>()) }
            eventSlot.captured.submission shouldBe submission
        }

        test("throw ForbiddenException when submission is in JUDGING status") {
            val submissionId = UUID.randomUUID()
            val submission = SubmissionMockFactory.build(id = submissionId, status = Submission.Status.JUDGING)
            val answer = Submission.Answer.ACCEPTED
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)

            shouldThrow<ForbiddenException> {
                sut.updateAnswer(submissionId, answer)
            }
        }

        test("throw NotFoundException when submission does not exist") {
            val submissionId = UUID.randomUUID()
            val answer = Submission.Answer.ACCEPTED
            every { submissionRepository.findById(submissionId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.updateAnswer(submissionId, answer)
            }
        }

        test("throw ForbiddenException when answer is NO_ANSWER") {
            val submissionId = UUID.randomUUID()
            val submission = SubmissionMockFactory.build(id = submissionId, status = Submission.Status.FAILED)
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)

            shouldThrow<ForbiddenException> {
                sut.updateAnswer(submissionId, Submission.Answer.NO_ANSWER)
            }
        }
    }
})
