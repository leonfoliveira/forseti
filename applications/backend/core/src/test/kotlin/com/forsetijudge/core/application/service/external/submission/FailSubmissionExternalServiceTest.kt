package com.forsetijudge.core.application.service.external.submission

import com.forsetijudge.core.application.util.IdGenerator
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
import com.forsetijudge.core.port.driving.usecase.external.submission.FailSubmissionUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher

class FailSubmissionExternalServiceTest :
    FunSpec({
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            FailSubmissionService(
                submissionRepository = submissionRepository,
                memberRepository = memberRepository,
                applicationEventPublisher = applicationEventPublisher,
            )

        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(memberId = contextMemberId)
        }

        val command =
            FailSubmissionUseCase.Command(
                submissionId = IdGenerator.getUUID(),
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

        Member.Type.entries.filter { it != Member.Type.API }.forEach { memberType ->
            test("should throw ForbiddenException when member type is $memberType") {
                val submission = SubmissionMockBuilder.build()
                val member = MemberMockBuilder.build(type = memberType)
                every { submissionRepository.findById(command.submissionId) } returns submission
                every { memberRepository.findById(contextMemberId) } returns member

                shouldThrow<ForbiddenException> { sut.execute(command) }
            }
        }

        test("should skip failing submission when submission is not in judging status") {
            val submission = SubmissionMockBuilder.build(status = Submission.Status.JUDGED)
            every { submissionRepository.findById(command.submissionId) } returns submission
            val member = MemberMockBuilder.build(type = Member.Type.API)
            every { memberRepository.findById(contextMemberId) } returns member

            sut.execute(command)

            verify(exactly = 0) { submissionRepository.save(any()) }
            verify(exactly = 0) { applicationEventPublisher.publishEvent(any()) }
        }

        test("should fail submission successfully") {
            val submission = SubmissionMockBuilder.build()
            every { submissionRepository.findById(command.submissionId) } returns submission
            val member = MemberMockBuilder.build(type = Member.Type.API)
            every { memberRepository.findById(contextMemberId) } returns member
            every { submissionRepository.save(any()) } returnsArgument 0

            sut.execute(command)

            submission.status shouldBe Submission.Status.FAILED
            verify { submissionRepository.save(submission) }
            verify { applicationEventPublisher.publishEvent(match<SubmissionEvent.Updated> { it.submission == submission }) }
        }
    })
