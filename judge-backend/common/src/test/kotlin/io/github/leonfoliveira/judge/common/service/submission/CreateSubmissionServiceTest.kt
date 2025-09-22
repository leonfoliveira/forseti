package io.github.leonfoliveira.judge.common.service.submission

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.event.SubmissionCreatedEvent
import io.github.leonfoliveira.judge.common.mock.entity.AttachmentMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ProblemMockBuilder
import io.github.leonfoliveira.judge.common.repository.AttachmentRepository
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.repository.ProblemRepository
import io.github.leonfoliveira.judge.common.repository.SubmissionRepository
import io.github.leonfoliveira.judge.common.service.dto.input.attachment.AttachmentInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.submission.CreateSubmissionInputDTO
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
import java.util.Optional
import java.util.UUID

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
            val memberId = UUID.randomUUID()
            val problemId = UUID.randomUUID()
            val inputDTO =
                CreateSubmissionInputDTO(
                    problemId = problemId,
                    language = Language.PYTHON_312,
                    code = AttachmentInputDTO(id = UUID.randomUUID()),
                )

            test("should throw NotFoundException when member does not exist") {
                every { memberRepository.findById(memberId) } returns Optional.empty()

                shouldThrow<NotFoundException> {
                    sut.create(memberId, inputDTO)
                }.message shouldBe "Could not find member with id = $memberId"
            }

            test("should throw NotFoundException when problem does not exist") {
                val member = MemberMockBuilder.build()
                every { memberRepository.findById(memberId) } returns Optional.of(member)
                every { problemRepository.findById(problemId) } returns Optional.empty()

                shouldThrow<NotFoundException> {
                    sut.create(memberId, inputDTO)
                }.message shouldBe "Could not find problem with id = $problemId"
            }

            test("should throw NotFoundException when code attachment does not exist") {
                val member = MemberMockBuilder.build()
                val problem = ProblemMockBuilder.build()
                every { memberRepository.findById(memberId) } returns Optional.of(member)
                every { problemRepository.findById(problemId) } returns Optional.of(problem)
                every { attachmentRepository.findById(inputDTO.code.id) } returns Optional.empty()

                shouldThrow<NotFoundException> {
                    sut.create(memberId, inputDTO)
                }.message shouldBe "Could not find code attachment with id = ${inputDTO.code.id}"
            }

            test("should throw ForbiddenException when language is not allowed for the contest") {
                val contest = ContestMockBuilder.build(languages = listOf())
                val member = MemberMockBuilder.build(contest = contest)
                val problem = ProblemMockBuilder.build(contest = contest)
                val attachment = AttachmentMockBuilder.build()
                every { memberRepository.findById(memberId) } returns Optional.of(member)
                every { problemRepository.findById(problemId) } returns Optional.of(problem)
                every { attachmentRepository.findById(inputDTO.code.id) } returns Optional.of(attachment)

                shouldThrow<ForbiddenException> {
                    sut.create(memberId, inputDTO)
                }.message shouldBe "Language ${inputDTO.language} is not allowed for this contest"
            }

            test("should throw ForbiddenException when contest is not active") {
                val contest =
                    ContestMockBuilder.build(
                        languages = listOf(Language.PYTHON_312),
                        startAt = OffsetDateTime.now().plusHours(1),
                    )
                val member = MemberMockBuilder.build(contest = contest)
                val problem = ProblemMockBuilder.build(contest = contest)
                val attachment = AttachmentMockBuilder.build()
                every { memberRepository.findById(memberId) } returns Optional.of(member)
                every { problemRepository.findById(problemId) } returns Optional.of(problem)
                every { attachmentRepository.findById(inputDTO.code.id) } returns Optional.of(attachment)

                shouldThrow<ForbiddenException> {
                    sut.create(memberId, inputDTO)
                }.message shouldBe "Contest is not active"
            }

            test("should create submission and publish events") {
                val contest =
                    ContestMockBuilder.build(
                        languages = listOf(Language.PYTHON_312),
                        startAt = OffsetDateTime.now().minusHours(1),
                    )
                val member = MemberMockBuilder.build(contest = contest)
                val problem = ProblemMockBuilder.build(contest = contest)
                val attachment = AttachmentMockBuilder.build()
                every { memberRepository.findById(memberId) } returns Optional.of(member)
                every { problemRepository.findById(problemId) } returns Optional.of(problem)
                every { attachmentRepository.findById(inputDTO.code.id) } returns Optional.of(attachment)
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
