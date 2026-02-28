package com.forsetijudge.core.application.service.external.submission

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ExecutionMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driven.sandbox.SubmissionRunner
import com.forsetijudge.core.port.driving.usecase.external.submission.AutoJudgeSubmissionUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher

class AutoJudgeSubmissionServiceTest :
    FunSpec({
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val submissionRunner = mockk<SubmissionRunner>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            AutoJudgeSubmissionService(
                submissionRepository = submissionRepository,
                memberRepository = memberRepository,
                submissionRunner = submissionRunner,
                applicationEventPublisher = applicationEventPublisher,
            )

        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(memberId = contextMemberId)
        }

        val command =
            AutoJudgeSubmissionUseCase.Command(
                submissionId = java.util.UUID.randomUUID(),
            )

        test("should throw NotFoundException when submission not found") {
            every { submissionRepository.findById(command.submissionId) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should throw NotFoundException when member not found") {
            val submission = SubmissionMockBuilder.build()
            every { submissionRepository.findById(command.submissionId) } returns submission
            every { memberRepository.findById(contextMemberId) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should throw ForbiddenException when member is not auto judge") {
            val submission = SubmissionMockBuilder.build()
            every { submissionRepository.findById(command.submissionId) } returns submission
            val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
            every { memberRepository.findById(contextMemberId) } returns member

            shouldThrow<ForbiddenException> { sut.execute(command) }
        }

        test("should skip judging process when submission is not in JUDGING status") {
            val submission = SubmissionMockBuilder.build(status = Submission.Status.JUDGED)
            every { submissionRepository.findById(command.submissionId) } returns submission
            val member = MemberMockBuilder.build(type = Member.Type.AUTOJUDGE)
            every { memberRepository.findById(contextMemberId) } returns member

            sut.execute(command)

            verify(exactly = 0) { submissionRunner.run(any()) }
            verify(exactly = 0) { submissionRepository.save(any()) }
            verify(exactly = 0) { applicationEventPublisher.publishEvent(any()) }
        }

        test("should run submission but skip update if submission status changes to not JUDGING") {
            val submission = SubmissionMockBuilder.build()
            every { submissionRepository.findById(command.submissionId) } returnsMany
                listOf(
                    submission,
                    SubmissionMockBuilder.build(status = Submission.Status.JUDGED),
                )
            val member = MemberMockBuilder.build(type = Member.Type.AUTOJUDGE)
            every { memberRepository.findById(contextMemberId) } returns member
            val execution = ExecutionMockBuilder.build()
            every { submissionRunner.run(submission) } returns execution

            sut.execute(command)

            verify { submissionRunner.run(submission) }
            verify(exactly = 0) { submissionRepository.save(any()) }
            verify(exactly = 0) { applicationEventPublisher.publishEvent(any()) }
        }

        test("should run submission and update status and answer") {
            val submission = SubmissionMockBuilder.build()
            every { submissionRepository.findById(command.submissionId) } returns submission
            val member = MemberMockBuilder.build(type = Member.Type.AUTOJUDGE)
            every { memberRepository.findById(contextMemberId) } returns member
            val execution = ExecutionMockBuilder.build()
            every { submissionRunner.run(submission) } returns execution
            every { submissionRepository.save(any()) } returnsArgument 0

            sut.execute(command)

            submission.status shouldBe Submission.Status.JUDGED
            submission.answer shouldBe execution.answer
            verify { submissionRepository.save(submission) }
            verify { applicationEventPublisher.publishEvent(match<SubmissionEvent.Updated> { it.submission == submission }) }
        }
    })
