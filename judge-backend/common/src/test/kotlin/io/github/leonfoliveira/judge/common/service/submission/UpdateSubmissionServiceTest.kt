package io.github.leonfoliveira.judge.common.service.submission

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.event.SubmissionEvent
import io.github.leonfoliveira.judge.common.event.SubmissionJudgeEvent
import io.github.leonfoliveira.judge.common.mock.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.repository.SubmissionRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import java.util.Optional
import java.util.UUID
import org.springframework.context.ApplicationEventPublisher

class UpdateSubmissionServiceTest : FunSpec({
    val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
    val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

    val sut = UpdateSubmissionService(
        submissionRepository = submissionRepository,
        applicationEventPublisher = applicationEventPublisher
    )

    beforeEach {
        clearAllMocks()
    }

    context("fail") {
        val submissionId = UUID.randomUUID()

        test("should throw NotFoundException when submission does not exist") {
            every { submissionRepository.findById(submissionId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.fail(submissionId)
            }.message shouldBe "Could not find submission with id = $submissionId"
        }

        test("should update submission status to FAILED") {
            val submission = SubmissionMockBuilder.build()
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)
            every { submissionRepository.save(any<Submission>()) } answers { firstArg() }

            sut.fail(submissionId)

            submission.status shouldBe Submission.Status.FAILED
            submissionRepository.save(submission)
            val eventSlot = slot<SubmissionEvent>()
            verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
            eventSlot.captured.submission shouldBe submission
        }
    }

    context("rerun") {
        val submissionId = UUID.randomUUID()

        test("should throw NotFoundException when submission does not exist") {
            every { submissionRepository.findById(submissionId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.rerun(submissionId)
            }.message shouldBe "Could not find submission with id = $submissionId"
        }

        test("should throw ForbiddenException when submission is already being judged") {
            val submission = SubmissionMockBuilder.build(status = Submission.Status.JUDGING)
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)

            shouldThrow<ForbiddenException> {
                sut.rerun(submissionId)
            }.message shouldBe "Submission with id = $submissionId is already being judged"
        }

        test("should update submission status to JUDGING and reset answer") {
            val submission = SubmissionMockBuilder.build(status = Submission.Status.JUDGED)
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)
            every { submissionRepository.save(any<Submission>()) } answers { firstArg() }

            sut.rerun(submissionId)

            submission.status shouldBe Submission.Status.JUDGING
            submission.answer shouldBe Submission.Answer.NO_ANSWER
            submissionRepository.save(submission)
            val eventSlot1 = slot<SubmissionEvent>()
            val eventSlot2 = slot<SubmissionJudgeEvent>()
            verify { applicationEventPublisher.publishEvent(capture(eventSlot1)) }
            verify { applicationEventPublisher.publishEvent(capture(eventSlot2)) }
            eventSlot1.captured.submission shouldBe submission
            eventSlot2.captured.submission shouldBe submission
        }
    }

    context("updateAnswer") {
        val submissionId = UUID.randomUUID()

        test("should throw NotFoundException when submission does not exist") {
            every { submissionRepository.findById(submissionId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.updateAnswer(submissionId, Submission.Answer.ACCEPTED)
            }.message shouldBe "Could not find submission with id = $submissionId"
        }

        test("should throw ForbiddenException when answer is NO_ANSWER") {
            val submission = SubmissionMockBuilder.build()
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)

            shouldThrow<ForbiddenException> {
                sut.updateAnswer(submissionId, Submission.Answer.NO_ANSWER)
            }.message shouldBe "Cannot update submission with NO_ANSWER"
        }

        test("should skip update if force is false and status is not JUDGING") {
            val submission = SubmissionMockBuilder.build(status = Submission.Status.FAILED)
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)

            sut.updateAnswer(submissionId, Submission.Answer.ACCEPTED, force = false)

            submission.status shouldBe Submission.Status.FAILED
            verify(exactly = 0) { submissionRepository.save(any<Submission>()) }
        }

        test("should update submission status to JUDGED and set answer") {
            val submission = SubmissionMockBuilder.build(status = Submission.Status.JUDGING)
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)
            every { submissionRepository.save(any<Submission>()) } answers { firstArg() }

            sut.updateAnswer(submissionId, Submission.Answer.ACCEPTED)

            submission.status shouldBe Submission.Status.JUDGED
            submission.answer shouldBe Submission.Answer.ACCEPTED
            submissionRepository.save(submission)
            val eventSlot = slot<SubmissionEvent>()
            verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
            eventSlot.captured.submission shouldBe submission
        }

        test("should update submission status to JUDGED and set answer with force") {
            val submission = SubmissionMockBuilder.build(status = Submission.Status.FAILED)
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)
            every { submissionRepository.save(any<Submission>()) } answers { firstArg() }

            sut.updateAnswer(submissionId, Submission.Answer.ACCEPTED, force = true)

            submission.status shouldBe Submission.Status.JUDGED
            submission.answer shouldBe Submission.Answer.ACCEPTED
            submissionRepository.save(submission)
            val eventSlot = slot<SubmissionEvent>()
            verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
            eventSlot.captured.submission shouldBe submission
        }
    }
})
