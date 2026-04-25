package com.forsetijudge.core.application.service.external.submission

import com.forsetijudge.core.application.helper.AttachmentWriterHelper
import com.forsetijudge.core.application.service.internal.outbox.OutboxEventPublisher
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.external.submission.CreateSubmissionUseCase
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseBodyDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify

class CreateSubmissionExternalServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val problemRepository = mockk<ProblemRepository>(relaxed = true)
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val frozenSubmissionRepository = mockk<FrozenSubmissionRepository>(relaxed = true)
        val attachmentWriterHelper = mockk<AttachmentWriterHelper>(relaxed = true)
        val outboxEventPublisher = mockk<OutboxEventPublisher>(relaxed = true)

        val sut =
            CreateSubmissionService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                problemRepository = problemRepository,
                submissionRepository = submissionRepository,
                frozenSubmissionRepository = frozenSubmissionRepository,
                outboxEventPublisher = outboxEventPublisher,
                attachmentWriterHelper = attachmentWriterHelper,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId = contextContestId, memberId = contextMemberId)
        }

        val problemId = IdGenerator.getUUID()
        val codeId = IdGenerator.getUUID()
        val command =
            CreateSubmissionUseCase.Command(
                problemId = problemId,
                language = Submission.Language.PYTHON_312,
                code = AttachmentCommandDTO(id = codeId),
            )

        test("should throw NotFoundException when contest does not exist") {
            every { contestRepository.findById(any()) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should throw NotFoundException when member does not exist") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(any()) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(any(), any()) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should throw ForbiddenException when member does not belong to contest") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build()
            every { contestRepository.findById(any()) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(any(), any()) } returns member

            shouldThrow<ForbiddenException> { sut.execute(command) }
        }

        Member.Type.entries.filter { it !in setOf(Member.Type.CONTESTANT, Member.Type.UNOFFICIAL_CONTESTANT) }.forEach { memberType ->
            test("should throw ForbiddenException when member type is $memberType") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = memberType, contest = contest)
                every { contestRepository.findById(any()) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(any(), any()) } returns member

                shouldThrow<ForbiddenException> { sut.execute(command) }
            }
        }

        test("should throw ForbiddenException when contest is not active") {
            val contest =
                ContestMockBuilder.build(
                    startAt = ExecutionContext.get().startedAt.plusHours(1),
                    endAt = ExecutionContext.get().startedAt.plusHours(2),
                )
            val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
            every { contestRepository.findById(any()) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(any(), any()) } returns member

            shouldThrow<ForbiddenException> { sut.execute(command) }
        }

        test("should throw NotFoundException when problem does not exist") {
            val contest =
                ContestMockBuilder.build(
                    startAt = ExecutionContext.get().startedAt.minusHours(1),
                    endAt = ExecutionContext.get().startedAt.plusHours(2),
                )
            val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
            every { contestRepository.findById(any()) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(any(), any()) } returns member
            every { problemRepository.findByIdAndContestId(command.problemId, contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should create submission successfully") {
            val contest =
                ContestMockBuilder.build(
                    startAt = ExecutionContext.get().startedAt.minusHours(1),
                    endAt = ExecutionContext.get().startedAt.plusHours(2),
                )
            val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
            val problem = ProblemMockBuilder.build()
            val code = AttachmentMockBuilder.build(context = Attachment.Context.SUBMISSION_CODE, isCommited = false)
            every { contestRepository.findById(any()) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(any(), any()) } returns member
            every { problemRepository.findByIdAndContestId(command.problemId, contextContestId) } returns problem
            every { attachmentWriterHelper.commit(command.code.id, contextContestId, Attachment.Context.SUBMISSION_CODE) } returns code
            every { submissionRepository.save(any()) } answers { firstArg() }
            every { frozenSubmissionRepository.save(any()) } answers { firstArg() }

            val result = sut.execute(command)

            val submissionSlot = slot<Submission>()
            verify { submissionRepository.save(capture(submissionSlot)) }
            val submission = submissionSlot.captured
            submission.member shouldBe member
            submission.problem shouldBe problem
            submission.language shouldBe command.language
            submission.status shouldBe Submission.Status.JUDGING
            submission.answer shouldBe null
            submission.code shouldBe code
            result shouldBe submission.toWithCodeResponseBodyDTO()
            verify { frozenSubmissionRepository.save(any()) }
            verify {
                outboxEventPublisher.publish(
                    match { it is SubmissionEvent.Created && it.submissionId == result.id },
                )
            }
        }
    })
