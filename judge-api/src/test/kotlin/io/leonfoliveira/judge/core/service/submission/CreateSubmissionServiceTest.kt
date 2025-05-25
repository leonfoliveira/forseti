package io.leonfoliveira.judge.core.service.submission

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.leonfoliveira.judge.core.domain.entity.AttachmentMockFactory
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.MemberMockFactory
import io.leonfoliveira.judge.core.domain.entity.ProblemMockFactory
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import io.leonfoliveira.judge.core.port.SubmissionQueueAdapter
import io.leonfoliveira.judge.core.repository.AttachmentRepository
import io.leonfoliveira.judge.core.repository.MemberRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
import io.leonfoliveira.judge.core.repository.SubmissionRepository
import io.leonfoliveira.judge.core.service.dto.input.CreateSubmissionInputDTOMockFactory
import io.leonfoliveira.judge.core.util.TimeUtils
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import jakarta.validation.Validation
import java.time.LocalDateTime
import java.util.Optional

class CreateSubmissionServiceTest : FunSpec({
    val attachmentRepository = mockk<AttachmentRepository>()
    val memberRepository = mockk<MemberRepository>()
    val problemRepository = mockk<ProblemRepository>()
    val submissionRepository = mockk<SubmissionRepository>()
    val submissionQueueAdapter = mockk<SubmissionQueueAdapter>()
    val submissionEmitterAdapter = mockk<SubmissionEmitterAdapter>()

    val sut =
        CreateSubmissionService(
            attachmentRepository,
            memberRepository,
            problemRepository,
            submissionRepository,
            submissionQueueAdapter,
            submissionEmitterAdapter,
        )

    val now = LocalDateTime.now()

    beforeEach {
        mockkObject(TimeUtils)
        every { TimeUtils.now() } returns now
    }

    context("create") {
        test("should throw NotFoundException when member not found") {
            every { memberRepository.findById(1) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.create(1, 2, CreateSubmissionInputDTOMockFactory.build())
            }
        }

        test("should throw NotFoundException when problem not found") {
            every { memberRepository.findById(1) }
                .returns(Optional.of(MemberMockFactory.build()))
            every { problemRepository.findById(2) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.create(1, 2, CreateSubmissionInputDTOMockFactory.build())
            }
        }

        test("should throw ForbiddenException when member does not belong to the contest of the problem") {
            val member = MemberMockFactory.build()
            val problem = ProblemMockFactory.build()

            every { attachmentRepository.findById(any()) }
                .returns(Optional.of(AttachmentMockFactory.build()))
            every { memberRepository.findById(1) }
                .returns(Optional.of(member))
            every { problemRepository.findById(2) }
                .returns(Optional.of(problem))

            shouldThrow<ForbiddenException> {
                sut.create(1, 2, CreateSubmissionInputDTOMockFactory.build())
            }
        }

        test("should throw ForbiddenException when language is not allowed for the contest") {
            val contest = ContestMockFactory.build(languages = listOf())
            val member = MemberMockFactory.build(contest = contest)
            val problem = ProblemMockFactory.build(contest = contest)

            every { attachmentRepository.findById(any()) }
                .returns(Optional.of(AttachmentMockFactory.build()))
            every { memberRepository.findById(1) }
                .returns(Optional.of(member))
            every { problemRepository.findById(2) }
                .returns(Optional.of(problem))

            shouldThrow<ForbiddenException> {
                sut.create(1, 2, CreateSubmissionInputDTOMockFactory.build())
            }
        }

        test("should throw ForbiddenException when contest is not active") {
            val contest =
                ContestMockFactory.build(
                    startAt = now.plusDays(1),
                )
            val member = MemberMockFactory.build(contest = contest)
            val problem = ProblemMockFactory.build(contest = contest)

            every { attachmentRepository.findById(any()) }
                .returns(Optional.of(AttachmentMockFactory.build()))
            every { memberRepository.findById(1) }
                .returns(Optional.of(member))
            every { problemRepository.findById(2) }
                .returns(Optional.of(problem))

            shouldThrow<ForbiddenException> {
                sut.create(1, 2, CreateSubmissionInputDTOMockFactory.build())
            }
        }

        test("should create a submission") {
            val contest =
                ContestMockFactory.build(
                    startAt = now.minusDays(1),
                    endAt = now.plusDays(1),
                )
            val member = MemberMockFactory.build(contest = contest)
            val problem = ProblemMockFactory.build(contest = contest)
            val inputDTO = CreateSubmissionInputDTOMockFactory.build()

            val attachment = AttachmentMockFactory.build()
            every { attachmentRepository.findById(any()) }
                .returns(Optional.of(attachment))
            every { memberRepository.findById(1) }
                .returns(Optional.of(member))
            every { problemRepository.findById(2) }
                .returns(Optional.of(problem))
            every { submissionRepository.save(any()) }
                .returnsArgument(0)
            every { submissionQueueAdapter.enqueue(any()) }
                .returns(Unit)
            every { submissionEmitterAdapter.emitForContest(any()) }
                .returns(Unit)

            val result = sut.create(1, 2, inputDTO)

            result.member.id shouldBe member.id
            result.member.name shouldBe member.name
            result.problem.id shouldBe problem.id
            result.problem.title shouldBe problem.title
            result.language shouldBe inputDTO.language
            result.status shouldBe Submission.Status.JUDGING
            result.codeKey shouldBe attachment.key
        }
    }
})
