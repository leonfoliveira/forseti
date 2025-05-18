package io.leonfoliveira.judge.core.service.submission

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.MemberMockFactory
import io.leonfoliveira.judge.core.domain.entity.ProblemMockFactory
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.domain.model.Attachment
import io.leonfoliveira.judge.core.domain.model.RawAttachment
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import io.leonfoliveira.judge.core.port.SubmissionQueueAdapter
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
    val memberRepository = mockk<MemberRepository>()
    val problemRepository = mockk<ProblemRepository>()
    val submissionRepository = mockk<SubmissionRepository>()
    val bucketAdapter = mockk<BucketAdapter>()
    val submissionQueueAdapter = mockk<SubmissionQueueAdapter>()
    val submissionEmitterAdapter = mockk<SubmissionEmitterAdapter>()

    val validator = Validation.buildDefaultValidatorFactory().validator

    val sut =
        CreateSubmissionService(
            memberRepository,
            problemRepository,
            submissionRepository,
            bucketAdapter,
            submissionQueueAdapter,
            submissionEmitterAdapter,
        )

    val now = LocalDateTime.now()

    beforeEach {
        mockkObject(TimeUtils)
        every { TimeUtils.now() } returns now
    }

    context("create") {
        listOf(
            CreateSubmissionInputDTOMockFactory.build(code = RawAttachment(filename = "", content = ByteArray(0))),
        ).forEach { dto ->
            test("should validate inputDTO") {
                validator.validate(dto).size shouldNotBe 0
            }
        }

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

            every { memberRepository.findById(1) }
                .returns(Optional.of(member))
            every { problemRepository.findById(2) }
                .returns(Optional.of(problem))
            val attachment =
                Attachment(
                    filename = "code.java",
                    key = "code_key",
                )
            every { bucketAdapter.upload(inputDTO.code) }
                .returns(attachment)
            every { submissionRepository.save(any()) }
                .returnsArgument(0)
            every { submissionQueueAdapter.enqueue(any()) }
                .returns(Unit)
            every { submissionEmitterAdapter.emit(any()) }
                .returns(Unit)

            val result = sut.create(1, 2, inputDTO)

            result.member shouldBe member
            result.problem shouldBe problem
            result.language shouldBe inputDTO.language
            result.status shouldBe Submission.Status.JUDGING
            result.code shouldBe attachment
        }
    }
})
