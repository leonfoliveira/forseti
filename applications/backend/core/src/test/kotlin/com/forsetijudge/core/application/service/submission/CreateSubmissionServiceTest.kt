package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionCreatedEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.dto.input.attachment.AttachmentInputDTO
import com.forsetijudge.core.port.dto.input.submission.CreateSubmissionInputDTO
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.time.OffsetDateTime

class CreateSubmissionServiceTest :
    FunSpec({
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val problemRepository = mockk<ProblemRepository>(relaxed = true)
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            CreateSubmissionService(
                attachmentRepository,
                memberRepository,
                problemRepository,
                submissionRepository,
                applicationEventPublisher,
            )

        beforeEach {
            clearAllMocks()
        }

        context("create") {
            val memberId = UuidCreator.getTimeOrderedEpoch()
            val problemId = UuidCreator.getTimeOrderedEpoch()
            val inputDTO =
                CreateSubmissionInputDTO(
                    problemId = problemId,
                    language = Submission.Language.PYTHON_312,
                    code = AttachmentInputDTO(id = UuidCreator.getTimeOrderedEpoch()),
                )

            test("should throw NotFoundException when member does not exist") {
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> {
                    sut.create(memberId, inputDTO)
                }.message shouldBe "Could not find member with id = $memberId"
            }

            test("should throw NotFoundException when problem does not exist") {
                val member = MemberMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns member
                every { problemRepository.findEntityById(problemId) } returns null

                shouldThrow<NotFoundException> {
                    sut.create(memberId, inputDTO)
                }.message shouldBe "Could not find problem with id = $problemId"
            }

            test("should throw NotFoundException when code attachment does not exist") {
                val member = MemberMockBuilder.build()
                val problem = ProblemMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns member
                every { problemRepository.findEntityById(problemId) } returns problem
                every { attachmentRepository.findEntityById(inputDTO.code.id) } returns null

                shouldThrow<NotFoundException> {
                    sut.create(memberId, inputDTO)
                }.message shouldBe "Could not find code attachment with id = ${inputDTO.code.id}"
            }

            test("should throw ForbiddenException when attachment has wrong context") {
                val contest = ContestMockBuilder.build(languages = listOf())
                val problem = ProblemMockBuilder.build(contest = contest)
                val attachment = AttachmentMockBuilder.build(context = Attachment.Context.PROBLEM_TEST_CASES)
                every { problemRepository.findEntityById(problemId) } returns problem
                every { attachmentRepository.findEntityById(inputDTO.code.id) } returns attachment

                shouldThrow<ForbiddenException> {
                    sut.create(memberId, inputDTO)
                }.message shouldBe "Attachment with id = ${inputDTO.code.id} is not a submission code"
            }

            test("should throw ForbiddenException when language is not allowed for the contest") {
                val contest = ContestMockBuilder.build(languages = listOf())
                val member = MemberMockBuilder.build(contest = contest)
                val problem = ProblemMockBuilder.build(contest = contest)
                val attachment = AttachmentMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns member
                every { problemRepository.findEntityById(problemId) } returns problem
                every { attachmentRepository.findEntityById(inputDTO.code.id) } returns attachment

                shouldThrow<ForbiddenException> {
                    sut.create(memberId, inputDTO)
                }.message shouldBe "Language ${inputDTO.language} is not allowed for this contest"
            }

            test("should throw ForbiddenException when contest is not active") {
                val contest =
                    ContestMockBuilder.build(
                        languages = listOf(Submission.Language.PYTHON_312),
                        startAt = OffsetDateTime.now().plusHours(1),
                    )
                val member = MemberMockBuilder.build(contest = contest)
                val problem = ProblemMockBuilder.build(contest = contest)
                val attachment = AttachmentMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns member
                every { problemRepository.findEntityById(problemId) } returns problem
                every { attachmentRepository.findEntityById(inputDTO.code.id) } returns attachment

                shouldThrow<ForbiddenException> {
                    sut.create(memberId, inputDTO)
                }.message shouldBe "Contest is not active"
            }

            test("should create submission and publish events") {
                val contest =
                    ContestMockBuilder.build(
                        languages = listOf(Submission.Language.PYTHON_312),
                        startAt = OffsetDateTime.now().minusHours(1),
                    )
                val member = MemberMockBuilder.build(contest = contest)
                val problem = ProblemMockBuilder.build(contest = contest)
                val attachment = AttachmentMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns member
                every { problemRepository.findEntityById(problemId) } returns problem
                every { attachmentRepository.findEntityById(inputDTO.code.id) } returns attachment
                every { submissionRepository.save(any<Submission>()) } answers { firstArg() }

                val submission = sut.create(memberId, inputDTO)

                submission.member shouldBe member
                submission.problem shouldBe problem
                submission.language shouldBe inputDTO.language
                submission.status shouldBe Submission.Status.JUDGING
                submission.code shouldBe attachment

                every { submissionRepository.save(submission) } returns submission
                val eventSlot1 = slot<SubmissionCreatedEvent>()
                verify { applicationEventPublisher.publishEvent(capture(eventSlot1)) }
                eventSlot1.captured.submission shouldBe submission
            }
        }
    })
