package io.github.leonfoliveira.forseti.common.application.service.submission

import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.application.domain.event.SubmissionRerunEvent
import io.github.leonfoliveira.forseti.common.application.domain.event.SubmissionUpdatedEvent
import io.github.leonfoliveira.forseti.common.application.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.SubmissionRepository
import io.github.leonfoliveira.forseti.common.mock.entity.SubmissionMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.util.UUID

class UpdateSubmissionServiceTest :
    FunSpec({
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            UpdateSubmissionService(
                submissionRepository = submissionRepository,
                applicationEventPublisher = applicationEventPublisher,
            )

        beforeEach {
            clearAllMocks()
        }

        context("fail") {
            val submissionId = UUID.randomUUID()

            test("should throw NotFoundException when submission does not exist") {
                every { submissionRepository.findEntityById(submissionId) } returns null

                shouldThrow<NotFoundException> {
                    sut.fail(submissionId)
                }.message shouldBe "Could not find submission with id = $submissionId"
            }

            test("should update submission status to FAILED") {
                val submission = SubmissionMockBuilder.build()
                every { submissionRepository.findEntityById(submissionId) } returns submission
                every { submissionRepository.save(any<Submission>()) } answers { firstArg() }

                sut.fail(submissionId)

                submission.status shouldBe Submission.Status.FAILED
                submissionRepository.save(submission)
                val eventSlot = slot<SubmissionUpdatedEvent>()
                verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
                eventSlot.captured.submission shouldBe submission
            }
        }

        context("rerun") {
            val submissionId = UUID.randomUUID()

            test("should throw NotFoundException when submission does not exist") {
                every { submissionRepository.findEntityById(submissionId) } returns null

                shouldThrow<NotFoundException> {
                    sut.rerun(submissionId)
                }.message shouldBe "Could not find submission with id = $submissionId"
            }

            test("should throw ForbiddenException when submission is already being judged") {
                val submission = SubmissionMockBuilder.build(status = Submission.Status.JUDGING)
                every { submissionRepository.findEntityById(submissionId) } returns submission

                shouldThrow<ForbiddenException> {
                    sut.rerun(submissionId)
                }.message shouldBe "Submission with id = $submissionId is already being judged"
            }

            test("should update submission status to JUDGING and reset answer") {
                val submission = SubmissionMockBuilder.build(status = Submission.Status.JUDGED)
                every { submissionRepository.findEntityById(submissionId) } returns submission
                every { submissionRepository.save(any<Submission>()) } answers { firstArg() }

                sut.rerun(submissionId)

                submission.status shouldBe Submission.Status.JUDGING
                submission.answer shouldBe Submission.Answer.NO_ANSWER
                submissionRepository.save(submission)
                val eventSlot1 = slot<SubmissionUpdatedEvent>()
                val eventSlot2 = slot<SubmissionRerunEvent>()
                verify { applicationEventPublisher.publishEvent(capture(eventSlot1)) }
                verify { applicationEventPublisher.publishEvent(capture(eventSlot2)) }
                eventSlot1.captured.submission shouldBe submission
                eventSlot2.captured.submission shouldBe submission
            }
        }

        context("updateAnswer") {
            val submissionId = UUID.randomUUID()

            test("should throw NotFoundException when submission does not exist") {
                every { submissionRepository.findEntityById(submissionId) } returns null

                shouldThrow<NotFoundException> {
                    sut.updateAnswer(submissionId, Submission.Answer.ACCEPTED)
                }.message shouldBe "Could not find submission with id = $submissionId"
            }

            test("should throw ForbiddenException when answer is NO_ANSWER") {
                val submission = SubmissionMockBuilder.build()
                every { submissionRepository.findEntityById(submissionId) } returns submission

                shouldThrow<ForbiddenException> {
                    sut.updateAnswer(submissionId, Submission.Answer.NO_ANSWER)
                }.message shouldBe "Cannot update submission with NO_ANSWER"
            }

            test("should skip update if force is false and status is not JUDGING") {
                val submission = SubmissionMockBuilder.build(status = Submission.Status.FAILED)
                every { submissionRepository.findEntityById(submissionId) } returns submission

                sut.updateAnswer(submissionId, Submission.Answer.ACCEPTED, force = false)

                submission.status shouldBe Submission.Status.FAILED
                verify(exactly = 0) { submissionRepository.save(any<Submission>()) }
            }

            test("should update submission status to JUDGED and set answer") {
                val submission = SubmissionMockBuilder.build(status = Submission.Status.JUDGING)
                every { submissionRepository.findEntityById(submissionId) } returns submission
                every { submissionRepository.save(any<Submission>()) } answers { firstArg() }

                sut.updateAnswer(submissionId, Submission.Answer.ACCEPTED)

                submission.status shouldBe Submission.Status.JUDGED
                submission.answer shouldBe Submission.Answer.ACCEPTED
                submissionRepository.save(submission)
                val eventSlot = slot<SubmissionUpdatedEvent>()
                verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
                eventSlot.captured.submission shouldBe submission
            }

            test("should update submission status to JUDGED and set answer with force") {
                val submission = SubmissionMockBuilder.build(status = Submission.Status.FAILED)
                every { submissionRepository.findEntityById(submissionId) } returns submission
                every { submissionRepository.save(any<Submission>()) } answers { firstArg() }

                sut.updateAnswer(submissionId, Submission.Answer.ACCEPTED, force = true)

                submission.status shouldBe Submission.Status.JUDGED
                submission.answer shouldBe Submission.Answer.ACCEPTED
                submissionRepository.save(submission)
                val eventSlot = slot<SubmissionUpdatedEvent>()
                verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
                eventSlot.captured.submission shouldBe submission
            }
        }
    })
